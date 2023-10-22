const Discord = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['commands', 'h', 'info', 'command'],
    description: 'Tell everything about the bot',
    execute(message) {
        const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Commands of this bot')
        .setDescription(
            `**.about**: status of the bot.\n` +
            `**.help**: explains the commands.\n` +
            `**.jukebox**: plays local and remote .mp3 files.\n` +
            `**.ping**: tests the connection to the bot.\n` +
            `**.player**: streams audio from youtube.\n` +
            `**.stop**: removes washo from the voice channel.\n\n` +
            `If you want to know more about a specific command, digit .command_name -h or -help.\n`
            )

        return message.channel
            .send({
                embeds: [embed]
            })
            .catch(console.error);
    },
};