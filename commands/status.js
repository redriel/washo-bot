const { name, version, description, author } = require('./../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'status',
    aliases: ['version', 'washo'],
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
            embeds: [{
                description: botInfoEmbed
            }]
        })
        //.send({ embed: botInfoEmbed });
    },
};