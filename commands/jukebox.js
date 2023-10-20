const { defaultJukeboxVolume } = require('../config.json');
const { join } = require('path');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { createReadStream } = require('fs');

let currentVolume = defaultJukeboxVolume;
let local_track = false;
let title = 'Some random music';

module.exports = {
    name: 'jukebox',
    aliases: ['w', 'wk', 'j', 'jbox', 'walkman'],
    description: 'Play the virtual jukebox with online tracks',
    async execute(message, args) {
        if (args[0] == '-h' || args[0] == 'h' || args[0] == '-help' || args[0] == 'help') {
            return message.channel
                .send({
                    embeds: [{
                        title: `Usage of .jukebox command`,
                        description: `After the command, pass as argument the track number or the mp3 link.\n` +
                        `**Example**: .jukebox www.my-mp3-link.com/mymp3.mp3 or\n` +
                        `**Example**: .jukebox 1\n` +
                        `You can use the following aliases instead of .jukebox: .j .jbox .w .wk .walkman\n` +
                        `You can also see the local track list using -t as an argument.\n`
                    }]
                })
                .catch(console.error);
        } else if (args[0] == '-t' || args[0] == 't' || args[0] == '-tracklist' || args[0] == 'tracklist') {
            return message.channel
                .send({
                    embeds: [{
                        title: `Local tracks`,
                        description: 
                        `1 -- **Midnight, the Stars and you**\n` +
                        `2 -- **Chuck gioca a CS**\n`
                    }]
                })
                .catch(console.error);
        }
        if (message.member.voice.channel) {
            let track = args[0];
            if (track == 'midnight' || track == '1') {
                local_track = true;
                track = '../resources/midnight.mp3';
                title = 'Midnight, the Stars and You';
            } else if (track == 'chuck' || track == '2') {
                local_track = true;
                track = '../resources/chuck.mp3';
                title = 'Chuck gioca a CS';
            }

            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guildId,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
            });
            const player = createAudioPlayer();
            let resource = null;
            if (local_track == true) {
                resource = createAudioResource(createReadStream(join(__dirname, track)), {
                    inlineVolume: true
                });
            } else {
                resource =
                    createAudioResource(track, {
                        inlineVolume: true
                    });
            }
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
                    `Jukebox started.\n` +
                    `Title: **${title}**\n` +
                    `Requested by: **${(message.author.username)}**\n`)

            message.channel
                .send({
                    embeds: [embed],
                    components: [row],
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
                .catch(console.error);
        }
    },
};