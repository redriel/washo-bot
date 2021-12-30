const ytdl = require('ytdl-core');
const humanizeDuration = require('humanize-duration');
const { msgExpireTime, defaultPlayerVolume } = require('./../config.json');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, generateDependencyReport } = require('@discordjs/voice');
let currentVolume = defaultPlayerVolume;

module.exports = {
    name: 'youtube',
    aliases: ['y', 'play', 'p'],
    description: 'Play music from youtube',
    async execute(message, args) {
        try {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guildId,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
            });
            const songInfo = await ytdl.getInfo(args[0]);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                length: songInfo.videoDetails.lengthSeconds
            };
            console.log(song.url);
            const stream = ytdl(song.url, {
                filter: 'audioonly'
            });
            const player = createAudioPlayer();
            const resource = createAudioResource(stream, {
                inlineVolume: true
            });
            resource.volume.setVolume(0.5);
            connection.subscribe(player);
            player.play(resource);
            //const connection = await message.member.voice.channel.join();
            //const dispatcher = connection.play(await ytdl(args[0]), { opusEncoded: true, volume: 0.5 });
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️', '🔉', '🔊'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            // player.on('start', () => {
            //     message.channel
            //         .send({
            //             embeds: [{
            //                 description: `Now playing from YouTube  🌐\n` +
            //                     `Title: **${song.title}**\n` +
            //                     `Duration: **${humanizeDuration(song.length * 1000)}**`
            //             }]
            //         })
            //         .then(msg => {
            //             msg.react('⏸️');
            //             msg.react('▶️');
            //             msg.react('⏹️');
            //             msg.react('🔉');
            //             msg.react('🔊');
            //             setTimeout(() => msg.delete(), song.length * 1000)
            //             const collector = msg.createReactionCollector(filter, { time: song.length * 1000 });
            //             collector.on('collect', r => {
            //                 switch (r.emoji.name) {
            //                     case '⏸️':
            //                         dispatcher.pause(true);
            //                         r.users.remove(r.users.cache.filter(u => !u.bot).first());
            //                         break;
            //                     case '▶️':
            //                         dispatcher.resume();
            //                         r.users.remove(r.users.cache.filter(u => !u.bot).first());
            //                         break;
            //                     case '⏹️':
            //                         connection.disconnect();
            //                         r.users.remove(r.users.cache.filter(u => !u.bot).first());
            //                         msg.delete();
            //                         break;
            //                     case '🔉':
            //                         currentVolume > 0.25 ? currentVolume -= 0.2 : currentVolume;
            //                         dispatcher.setVolume(currentVolume);
            //                         r.users.remove(r.users.cache.filter(u => !u.bot).first());
            //                         break;
            //                     case '🔊':
            //                         currentVolume < 1.75 ? currentVolume += 0.2 : currentVolume;
            //                         dispatcher.setVolume(currentVolume);
            //                         r.users.remove(r.users.cache.filter(u => !u.bot).first());
            //                         break;
            //                     default: r.users.remove(r.users.cache.filter(u => !u.bot).first());
            //                 }
            //             });
            //         });
            // });
            // player.on('finish', () => {
            //     connection.disconnect();
            // });
            // player.on('error', console.error);
        } catch (error) {
            console.error(error);
            return message.channel
                .send({
                    embeds: [{
                        description: `The URL ${args[0]} is invalid. Fuck YouTube.`
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    },
};