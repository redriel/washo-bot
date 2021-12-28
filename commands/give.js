const { currencyUnit, msgExpireTime } = require('./../config.json');
const { users } = require('./../db_schema');
const Discord = require('discord.js');
let currency = new Discord.Collection();

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

async function loadBalance(id) {
    const storedBalances = await users.findAll({ where: { user_id: id } });
    storedBalances.forEach(b => currency.set(b.user_id, b));
}

module.exports = {
    name: 'give',
    aliases: ['g'],
    description: 'Give another user credits',
    async execute(message, args) {

        const giver = message.author;
        const giverUser = await users.findOne({ where: { user_id: giver.id } });
        const receiver = message.mentions.users.first();
        const receiverUser = await users.findOne({ where: { user_id: receiver.id } });

        if (giverUser == null || giverUser == undefined || receiver == null || receiverUser == undefined) {
            return message.channel
                .send({
                    embed: {
                        description: `**${giver.username}**, either you or the receiver of the donation are not registered.\n` +
                            `To register, please insert the command \`.register\``
                    }
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
        args[1] = parseInt(args[1], 10);
        if (!Number.isInteger(args[1])) {
            return message.channel
                .send({
                    embed: {
                        description: `**${giver.username}**, your command syntax is incorrect.\n` +
                            `A correct example would be: \`.give @user 10\``
                    }
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }

        await loadBalance(giver.id);
        const giverBalance = currency.getBalance(giver.id);
        const donation = args[1];

        if (donation > giverBalance) {
            return message.channel
                .send({ embed: { description: `Sorry ${giver.username}, you only have ${giverBalance} ${currencyUnit}` } })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
        if (donation <= 0) {
            return message.channel
                .send({ embed: { description: `Please ${giver.username}, insert an amount greater than 0 of ${currencyUnit}` } })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }

        await loadBalance(receiver.id);
        await currency.add(giver.id, -donation);
        await currency.add(receiver.id, +donation);

        return message.channel
            .send({
                embed: {
                    description: `**${giver.username}** ➡️ **${donation}** ${currencyUnit} ➡️ **${receiver.username}**\n` +
                        `Transaction completed! 🥳🥳🥳\n` +
                        `**${giver.username}** current balance: **${currency.getBalance(giver.id)}** ${currencyUnit}\n` +
                        `**${receiver.username}** current balance: **${currency.getBalance(receiver.id)}** ${currencyUnit}`
                }
            })
            .then(msg => {
                msg.delete({ timeout: msgExpireTime })
            })
            .catch(console.error);
    },
};