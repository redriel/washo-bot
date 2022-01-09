const { defaultJukeboxVolume } = require('./../config.json');
const ytdl = require('ytdl-core');
const random = require('random');
const fs = require('fs');
const { join } = require('path');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, generateDependencyReport } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const humanizeDuration = require('humanize-duration');
const mp3Duration = require('mp3-duration');
const { createReadStream } = require('fs');

let currentVolume = defaultJukeboxVolume;

module.exports = {
    name: 'walkman',
    aliases: ['w', 'wk'],
    description: 'Play the virtual walkman with online tracks',
    async execute(message, args) {
        if (message.member.voice.channel) {
            let track = '';
            !args.length ? track = 'https://www.mboxdrive.com/chuck.mp3' : track = args[0];
           
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guildId,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
            });
            const player = createAudioPlayer();
            const resource = 
            createAudioResource(track, {
                inlineVolume: true
            });
            resource.volume.setVolume(1);
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
                .setDescription(
                    `Now playing some random shit.\n` +
                    `Title: **MP3 Title**\n` +
                    `Duration: **not computed**\n`)
                .setImage('attachment://../resources/lofi.gif')

            message.channel
                .send({
                    embeds: [embed],
                    components: [row],
                    files: ['resources/lofi.gif']
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), 10000)
                })
                .catch(console.error);

            const filter = i => i.customId === 'pause' || i.customId === 'voldown' || i.customId === 'volup' || i.customId === 'stop';
            const collector = message.channel.createMessageComponentCollector({ filter, time: 100000 });

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
                    currentVolume = currentVolume - 0.2;
                    resource.volume.setVolume(currentVolume);
                    await i.update({});
                }
                else if (i.customId === 'volup') {
                    currentVolume = currentVolume + 0.2;
                    resource.volume.setVolume(currentVolume);
                    await i.update({});
                }
                else if (i.customId === 'stop') {
                    connection.disconnect();
                    message.channel.bulkDelete(1, true).catch(err => {
                        console.error(err);
                    });
                    await i.update({});
                }
            });
        } else {
            return message.channel
                .send({
                    embeds: [{
                        description: `No one is listening, and I'm feeling lazy.`
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), 10000)
                })
                .catch(console.error);
        }
    },
};