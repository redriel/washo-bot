const { msgExpireTime } = require('./../config.json');

module.exports = {
    name: 'stop',
    aliases: ['s', 'stp'],
    description: 'Stops any music transmission',
    async execute(message, args) {
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
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