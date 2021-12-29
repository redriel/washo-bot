const { currencyUnit, msgExpireTime } = require('./../config.json');
const { users, shop } = require('./../db_schema');
const Discord = require('discord.js');
const { Op } = require('sequelize');
let currency = new Discord.Collection();
let item;

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
    name: 'buy',
    aliases: [],
    description: 'Buy something from the shop',
    async execute(message, args) {
        const target = message.author;
        const user = await users.findOne({ where: { user_id: target.id } });
        if (!user) {
            return message.channel
                .send({
                    embeds: [{
                        description: `**${target.username}**, you are not registered.\n` +
                            `Please insert the command \`.register\``
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        } else {
            await loadBalance(target.id);
            if (Number.isInteger(Number.parseInt(args[0]))) {
                item = await shop.findOne({ where: { id: { [Op.like]: Number.parseInt(args[0]) } } });
            } else {
                const itemSelected = args.join(' ');
                item = await shop.findOne({ where: { name: { [Op.like]: itemSelected } } });
            }
            if (!item) {
                return message.channel
                    .send({
                        embeds: [{
                            description: `The selected item doesn't exist.`
                        }]
                    })
                    .then(msg => {
                        setTimeout(() => msg.delete(), msgExpireTime)
                    })
                    .catch(console.error);
            }
            if (item.cost > currency.getBalance(target.id)) {
                return message.channel
                    .send({
                        embeds: [{
                            description: `You currently have ${currency.getBalance(target.id)} ${currencyUnit}, ` +
                                `but the ${item.name} costs ${item.cost} ${currencyUnit}`
                        }]
                    })
                    .then(msg => {
                        setTimeout(() => msg.delete(), msgExpireTime)
                    })
                    .catch(console.error);
            }
            currency.add(target.id, -item.cost);
            await user.addItem(item);

            message.channel
                .send({
                    embeds: [{
                        description: `Congratulation, you bought **${item.name}**!\n` +
                            `Your current balance is ${currency.getBalance(target.id)} ${currencyUnit}`
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    },
};