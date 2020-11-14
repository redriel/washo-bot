const { currencyUnit, msgExpireTime } = require('./../config.json');
const { users, shop } = require('./../db_schema');
const Discord = require('discord.js');
const currency = new Discord.Collection();

Reflect.defineProperty(currency, 'add', {
    value: async function add(id, amount) {
        const user = currency.get(id);
        if (user) {
            user.balance += Number(amount);
            return user.save();
        }
        const newUser = await users.create({ user_id: id, balance: amount });
        currency.set(id, newUser);
        return newUser;
    },
});

Reflect.defineProperty(currency, 'getBalance', {
    value: function getBalance(id) {
        const user = currency.get(id);
        return user ? user.balance : 0;
    },
});

module.exports = {
    name: 'inventory',
    aliases: ['i', 'items'],
    description: 'Show the users its inventory',
    async execute(message, args) {
        const target = message.author;
        const user = await users.findOne({ where: { user_id: target.id } });
        if (user == null || user == undefined) {
            return message.channel
                .send({
                    embed: {
                        description: `**${target.tag}**, you are not registered.\n` +
                            `Please insert the command \`.register\``
                    }
                })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
        const items = await user.getItems();
        if (!items.length) {
            return message.channel.send({ embed: { description: `**${target.tag}**, you don't have any belongings!` } })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        } else {
            return message.channel.send(({ embed: { description:`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`}}))
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};