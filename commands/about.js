const { version, description, author } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'about',
    aliases: ['v', 'status', 'washo', 'version'],
    description: 'Tell everything about the bot',
    execute(message, args) {

        const botInfoEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Washo-bot info')
            .setDescription(
                `About: ${description}\n` +
                `Status: **Online**\n` +
                `Version: **${version}**\n` +
                `Author: **${author}**\n` +
                `Repo: https://github.com/redriel/washo-bot\n`)

        message.channel
        .send({
            embeds: [botInfoEmbed]
        })
        .catch(console.error);
    },
};