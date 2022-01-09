const fs = require('fs');
const { join } = require('path');
const mp3Duration = require('mp3-duration');
const humanizeDuration = require('humanize-duration');
const { defaultJukeboxVolume } = require('./../config.json');
const { users } = require('./../db_schema');
const { msgExpireTime, defaultPlayerVolume } = require('./../config.json');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, generateDependencyReport } = require('@discordjs/voice');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { createReadStream } = require('fs');
let currentVolume = defaultJukeboxVolume;

module.exports = {
    name: 'jukebox',
    aliases: ['j', 'jbox'],
    description: 'Play the old classic Midnight, the Stars and You',
    async execute(message, args) {
        const mp3FileDuration = await mp3Duration('resources/midnight.mp3') * 1000;
        if (message.member.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guildId,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
            });
            const player = createAudioPlayer();
            const resource = createAudioResource(createReadStream(join(__dirname, '../resources/midnight.mp3')), {
                inlineVolume: true
            });
            resource.volume.setVolume(0.4);
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
                    `Now playing an old time classic  📻\n` +
                    `Title: **Midnight, the Stars and You**\n` +
                    `Duration: **${humanizeDuration(mp3FileDuration)}**\n`)
                .setImage('attachment://../resources/lofi.gif')

            message.channel
                .send({
                    embeds: [embed],
                    components: [row],
                    files: ['resources/lofi.gif']
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), mp3FileDuration)
                })
                .catch(console.error);

            const filter = i => i.customId === 'pause' || i.customId === 'voldown' || i.customId === 'volup' || i.customId === 'stop';
            const collector = message.channel.createMessageComponentCollector({ filter, time: mp3FileDuration });

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
                    setTimeout(() => msg.delete(), mp3FileDuration)
                })
                .catch(console.error);
        }
    },
};