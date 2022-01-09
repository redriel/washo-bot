const fs = require('fs');
const { msgExpireTime } = require('./../config.json');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const Discord = require('discord.js');
commands = new Discord.Collection();
const { table } = require('table');
const customSplitMessage = (text) => [
    text.substring(0, 2000),
    text.substring(2000, text.length),
  ];

module.exports = {
    name: 'info',
    aliases: ['about', 'commands'],
    description: 'Tell everything about the bot',
    execute(message, args) {
        data = [
            [`COMMAND`, `ALIASES`, `USAGE`],
        ];
        commandFiles.forEach(cmd => {
            const command = require(`./${cmd}`);
            data.push([command.name, command.aliases.join(', '), command.description]);
        });
        const output = table(data);
        return message.channel
            //.send(`${output}`, { split: true, code: true })
            .send({
                embeds: [{
                    description: customSplitMessage(`${output}`.repeat(501))[0]
                }]
            })
            // .send({
            //     content: customSplitMessage(`${output}`.repeat(501))[0],
            //   })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    },
};