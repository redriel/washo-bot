const { msgExpireTime } = require('./../config.json');
const { users } = require('./../db_schema');

module.exports = {
    name: 'use',
    aliases: [],
    description: 'Show the users the usage of an item he/she owns',
    async execute(message, args) {
        const target = message.author;
        const user = await users.findOne({ where: { user_id: target.id } });
        if (user == null || user == undefined) {
            return message.channel
                .send({
                    embed: {
                        description: `**${target.username}**, you are not registered.\n` +
                            `Please insert the command \`.register\``
                    }
                })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
        if (args.length == 0) {
            return message.channel
                .send({
                    embed: {
                        description: `Sorry **${target.username}**, the syntax of your command is invalid.\n`
                            + `A correct example would be \`.use jukebox coin\``
                    }
                })
                .then(msg => { msg.delete({ timeout: msgExpireTime }) })
                .catch(console.error);
        }
        const items = await user.getItems();
        const itemName = args.join(' ');
        const itemSelected = await items.filter(i => i.item.name == itemName)[0];

        if (!items.length) {
            return message.channel.send({ embed: { description: `**${target.username}**, you don't have any belongings!` } })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        } else if (itemSelected == null || itemSelected == undefined) {
            return message.channel.send({ embed: { description: `**${target.username}**, you don't own that item!` } })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        } else {
            return message.channel.send({ embed: { description: `**${itemSelected.item.name}** usage: *${itemSelected.item.description}.*` } })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};