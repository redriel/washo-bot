const ytdl = require('ytdl-core');
const humanizeDuration = require('humanize-duration');
const { msgExpireTime, defaultPlayerVolume } = require('./../config.json');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, generateDependencyReport } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const wait = require('util').promisify(setTimeout);
let currentVolume = defaultPlayerVolume;

module.exports = {
    name: 'youtube',
    aliases: ['y', 'play', 'p', 'player'],
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
                length: songInfo.videoDetails.lengthSeconds,
                thumbnail: songInfo.videoDetails.thumbnails[3]
            };
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                highWaterMark: 1 << 25,
            });
            const player = createAudioPlayer();
            const resource = createAudioResource(stream, {
                inlineVolume: true
            });
            resource.volume.setVolume(currentVolume);
            connection.subscribe(player);
            player.play(resource);
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('pause')
                        .setLabel('PAUSE')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('voldown')
                        .setLabel('VOL -')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('volup')
                        .setLabel('VOL +')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('stop')
                        .setLabel('STOP')
                        .setStyle('DANGER')
                );
            const embed = new MessageEmbed()
                .setDescription(`Now playing from YouTube\n` +
                    `Title: **${song.title}**\n` +
                    `Duration: **${humanizeDuration(song.length * 1000)}**\n`)
                .setImage(song.thumbnail.url)

            message.channel
                .send({
                    embeds: [embed],
                    components: [row]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), song.length * 1000)
                })
                .catch(console.error);

            const filter = i => i.customId === 'pause' || i.customId === 'voldown' || i.customId === 'volup' || i.customId === 'stop';
            const collector = message.channel.createMessageComponentCollector({ filter, time: song.length * 1000 });

            collector.on('collect', async i => {
                if (i.customId === 'pause') {
                    if (player.state.status === 'playing') {
                        player.pause();
                        row.components[0].setLabel('PLAY');
                        row.components[0].setStyle('SUCCESS');
                        await i.update({ components: [row] });
                    } else {
                        player.unpause();
                        row.components[0].setLabel('PAUSE');
                        row.components[0].setStyle('PRIMARY');
                        await i.update({ components: [row] });
                    }
                }
                else if (i.customId === 'voldown') {
                    currentVolume = currentVolume - 0.1;
                    resource.volume.setVolume(currentVolume);
                    await i.update({ });
                }
                else if (i.customId === 'volup') {
                    currentVolume = currentVolume + 0.1;
                    resource.volume.setVolume(currentVolume);
                    await i.update({ });
                }
                else if (i.customId === 'stop') {
                    connection.disconnect();
                    message.channel.bulkDelete(1, true).catch(err => {
                        console.error(err);
                    });
                    await i.update({ });
                }
            });
        } catch (error) {
            console.error(error);
            return message.channel
                .send({
                    embeds: [{
                        description: `The URL ${args[0]} is invalid.`
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    },
};