const fs = require('fs');
const { msgExpireTime } = require('./../config.json');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const Discord = require('discord.js');
commands = new Discord.Collection();
const { table } = require('table');

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
            .send(`${output}`, {split: true, code: true})
            .then(msg => {
                msg.delete({ timeout: msgExpireTime })
            })
            .catch(console.error);
    },
};