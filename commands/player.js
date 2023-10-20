const play = require('play-dl');
const humanizeDuration = require('humanize-duration');
const defaultPlayerVolume = require('./../config.json');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
let currentVolume = defaultPlayerVolume;

module.exports = {
    name: 'player',
    aliases: ['y', 'play', 'p', 'youtube', 'yt'],
    description: 'Play music from youtube',
    async execute(message, args) {
        if (args[0] == '-h' || args[0] == 'h' || args[0] == '-help' || args[0] == 'help') {
            return message.channel
                .send({
                    embeds: [{
                        title: `Usage of .player command`,
                        description: `After the command, pass as argument the Youtube link of the video you want to stream.\n` +
                        `**Example**: .p www.my-youtube-link.com\n` +
                        `You can use the following aliases instead of .player: .p .y .play .youtube .yt\n`
                    }]
                })
                .catch(console.error);
        }
        try {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guildId,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
            });

            const videoInfo = await play.video_info(args[0]);
            const stream = await play.stream(args[0]);
            const song = {
                title: videoInfo.video_details.title,
                url: videoInfo.video_details.url,
                length: videoInfo.video_details.durationInSec,
                thumbnail: videoInfo.video_details.thumbnails[3]
            };

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });

            resource.volume.setVolume(currentVolume);
            player.play(resource);
            connection.subscribe(player);

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
                    `Duration: **${humanizeDuration(song.length * 1000)}**\n`) +
                    `Requested by: **${(message.author.username)}**\n`
                    .setImage(song.thumbnail.url)

            message.channel
                .send({
                    embeds: [embed],
                    components: [row]
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
                    await i.update({});
                }
                else if (i.customId === 'volup') {
                    currentVolume = currentVolume + 0.1;
                    resource.volume.setVolume(currentVolume);
                    await i.update({});
                }
                else if (i.customId === 'stop') {
                    connection.disconnect();
                    await i.update({});
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
                .catch(console.error);
        }
    },
};