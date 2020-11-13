const { currencyUnit, msgExpireTime } = require('./../config.json');
const { users } = require('./../db_schema');
const Discord = require('discord.js');
const random = require('random')
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

async function coinflip(user, wager) {
    const loadBalance = await loadBalance(user.id);
    const currentBalance = currency.getBalance(user.id);
}

async function rolldice(message, user, wager) {
    await loadBalance(user.id);
    const currentBalance = currency.getBalance(user.id);
    if (Number.isNaN(wager) || wager > currentBalance || wager <= 0) {
        return message.channel
            .send({ embed: { description: `Sorry **${message.author}**, that is an invalid amount of ${currencyUnit}` } })
            .then(msg => { msg.delete({ timeout: msgExpireTime }) })
            .catch(console.error);
    }
    await currency.add(message.author.id, -wager);
    const result = random.int(min = 1, max = 6);
    switch (result) {
        case 1:
        case 2:
        case 3:
            wager = 0;
            break;
        case 4:
            break;
        case 5:
            wager *= 2;
            break;
        case 6:
            wager *= 4;
            break;
        default:
    }
    await currency.add(message.author.id, +wager);
    if ([1, 2, 3].indexOf(result) > -1) {
        return message.channel
            .send({ embed: { description: `It's a **${result}** 🎲!\nSorry **${user.tag}**, you lost.\n` } })
            .then(msg => { msg.delete({ timeout: msgExpireTime }) })
            .catch(console.error);
    } else if ([5, 6].indexOf(result) > -1) {
        return message.channel
            .send({ embed: { description: `It's a **${result}** 🎲!\nWow **${user.tag}**, you won ${wager} ${currencyUnit}!\n` } })
            .then(msg => { msg.delete({ timeout: msgExpireTime }) })
            .catch(console.error);
    } else {
        return message.channel
            .send({ embed: { description: `It's a **${result}** 🎲!\nWell **${user.tag}**, you won back your ${wager} ${currencyUnit}!\n` } })
            .then(msg => { msg.delete({ timeout: msgExpireTime }) })
            .catch(console.error);
    }
}

module.exports = {
    name: 'bet',
    aliases: ['b'],
    description: 'Make the user gamble',
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

        const gambles = ['coinflip', 'cf', 'rolldice', 'rd'];
        if (gambles.indexOf(args[0]) > -1) {
            args[1] = parseInt(args[1], 10);
            if (Number.isInteger(args[1])) {
                const game = args[0];
                const wager = args[1];
                switch (game) {
                    case 'coinflip' || 'cf':
                        //coinflip(message, target, wager);
                        break;
                    case 'rolldice':
                    case 'rd':
                        rolldice(message, target, wager);
                        break;
                    default:
                }
            } else {
                return message.channel
                    .send({
                        embed: {
                            description: `**${target.tag}**, please insert an amount of ${currencyUnit} ` +
                                `you desire to bet after selecting the game\n` +
                                `**Example:** \`.bet rolldice 10\``
                        }
                    })
                    .then(msg => {
                        msg.delete({ timeout: msgExpireTime })
                    })
                    .catch(console.error);
            }
        } else {
            return message.channel
                .send(`**${target.tag}**, please select a game you wish to play.\n` +
                    `**Example:** \`.bet rolldice 10\``)
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};