const { name, version, description, author, msgExpireTime } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'version',
    aliases: ['v', 'status', 'washo'],
    description: 'Tell everything about the bot',
    execute(message, args) {

        const botInfoEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Washo-bot info')
            .addField('About', `\`${description}\``)
            .addField('Status', `\`ONLINE\``)
            .addField('Version', `\`${version}\``)
            .addField('Author', `\`${author}\``)
            .setFooter('https://github.com/redriel/washo-bot');

        message.channel
        .send({
            embeds: [botInfoEmbed]
        })
        .then(msg => {
            setTimeout(() => msg.delete(), msgExpireTime)
        })
        .catch(console.error);
    },
};