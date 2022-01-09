const { joinVoiceChannel } = require('@discordjs/voice');
const { msgExpireTime } = require('./../config.json');

module.exports = {
    name: 'stop',
    aliases: ['s', 'stp'],
    description: 'Stops any music transmission',
    async execute(message, args) {
        if (message.member.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guildId,
                adapterCreator:  message.member.voice.channel.guild.voiceAdapterCreator,
            });
            connection.disconnect();
        } else {
            return message.channel
                .send({
                    embeds: [{
                        description: `I'm not in the voice channel, I can't stop a shit.`
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    }
};