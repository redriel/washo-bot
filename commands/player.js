const ytdl = require('ytdl-core');
const humanizeDuration = require('humanize-duration');
const { msgExpireTime, defaultPlayerVolume } = require('./../config.json');
let currentVolume = defaultPlayerVolume;

module.exports = {
    name: 'youtube',
    aliases: ['y', 'play', 'p'],
    description: 'Play music from youtube',
    async execute(message, args) {
        try {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(await ytdl(args[0]), { opusEncoded: true, volume: 0.5 });
            const songInfo = await ytdl.getInfo(args[0]);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                length: songInfo.videoDetails.lengthSeconds
            };
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️', '🔉', '🔊'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            dispatcher.on('start', () => {
                message.channel.send({
                    embed: {
                        description: `Now playing from YouTube  🌐\n` +
                            `Title: **${song.title}**\n` +
                            `Duration: **${humanizeDuration(song.length * 1000)}**`
                    }
                }).then(msg => {
                    msg.react('⏸️');
                    msg.react('▶️');
                    msg.react('⏹️');
                    msg.react('🔉');
                    msg.react('🔊');
                    setTimeout(() => msg.delete(),  song.length * 1000)
                    //msg.delete({ timeout: song.length * 1000 });
                    const collector = msg.createReactionCollector(filter, { time: song.length * 1000 });
                    collector.on('collect', r => {
                        switch (r.emoji.name) {
                            case '⏸️':
                                dispatcher.pause(true);
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            case '▶️':
                                dispatcher.resume();
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            case '⏹️':
                                connection.disconnect();
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                msg.delete();
                                break;
                            case '🔉':
                                currentVolume > 0.25 ? currentVolume -= 0.2 : currentVolume;
                                dispatcher.setVolume(currentVolume);
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            case '🔊':
                                currentVolume < 1.75 ? currentVolume += 0.2 : currentVolume;
                                dispatcher.setVolume(currentVolume);
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            default: r.users.remove(r.users.cache.filter(u => !u.bot).first());
                        }
                    });
                });
            });
            dispatcher.on('finish', () => {
                connection.disconnect();
            });
            dispatcher.on('error', console.error);
        } catch (error) {
            console.error(error);
            return message.channel
                .send(({ embed: { description: `The URL ${args[0]} is invalid.` } }))
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    },
};