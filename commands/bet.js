const { currencyUnit, msgExpireTime } = require('./../config.json');
const { users } = require('./../db_schema');
const Discord = require('discord.js');
const random = require('random');
const gambles = ['head', 'h', 'tail', 't', 'rolldice', 'rd'];
let headOrTail = '';
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
    name: 'bet',
    aliases: ['b'],
    description: 'Make the user gamble',
    async execute(message, args) {
        const game = args[0];
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
        if (gambles.indexOf(game) > -1) {
            switch (game) {
                case 'head':
                case 'h':
                case 'tail':
                case 't':
                    coinflip(message, target, args);
                    break;
                case 'rolldice':
                case 'rd':
                    rolldice(message, target, args);
                    break;
                default:
            }
        } else {
            return message.channel
                .send({
                    embed: {
                        description: `**${target.username}**, please insert an amount of ${currencyUnit} ` +
                            `you desire to bet after selecting a game\n` +
                            `**Example:** \`.bet rolldice 10\`\n` +
                            `If you want more info about game, please insert the command \`.list games\``
                    }
                })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};

async function coinflip(message, target, args) {
    await loadBalance(target.id);
    const currentBalance = currency.getBalance(target.id);
    const coinSide = args[0], wager = parseInt(args[1], 10);
    if (coinSide == null || coinSide == undefined || ['head', 'h', 'tail', 't'].indexOf(coinSide) < 0) {
        return message.channel
            .send({
                embed: {
                    description: `Sorry **${target.username}**, the syntax of your command is invalid.\n`
                        + `A correct example would be \`.bet[b] head\\tail[h\\t] 10\``
                }
            })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    }
    if (Number.isNaN(wager) || !Number.isInteger(wager) || wager > currentBalance || wager <= 0) {
        return message.channel
            .send({ embed: { description: `Sorry **${target.username}**, that is an invalid amount of ${currencyUnit}` } })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    }
    await currency.add(target.id, -wager);
    const result = random.int(min = 1, max = 2);
    result == 1 ? headOrTail = 'head' : headOrTail = 'tail';
    if (((coinSide == 'head' || coinSide == 'h') && result == 1) ||
        ((coinSide == 'tail' || coinSide == 't') && result == 2)) {
        await currency.add(target.id, 2 * wager);
        return message.channel
            .send({
                embed: {
                    description: `You bet **${wager}** ${currencyUnit}\n` +
                        `It landed **${headOrTail}** ${headOrTail == 'head' ? `👤` : `🔘`}!\n` +
                        `**${target.username}**, you won **${2 * wager}** ${currencyUnit}!\n` +
                        `Your current balance is **${currency.getBalance(target.id)}** ${currencyUnit}`
                }
            })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    } else {
        return message.channel
            .send({
                embed: {
                    description: `You bet **${wager}** ${currencyUnit}\n` +
                        `It landed **${headOrTail}** ${headOrTail == 'head' ? `👤` : `🔘`}!\n` +
                        `Sorry **${target.username}**, you lost **${wager}** ${currencyUnit}!\n` +
                        `Your current balance is **${currency.getBalance(target.id)}** ${currencyUnit}`
                }
            })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    }
}

async function rolldice(message, target, args) {
    await loadBalance(target.id);
    const wager = parseInt(args[1], 10);
    let winning = wager;
    const currentBalance = currency.getBalance(target.id);
    if (Number.isNaN(wager) || !Number.isInteger(wager) || wager > currentBalance || wager <= 0) {
        return message.channel
            .send({ embed: { description: `Sorry **${target.username}**, that is an invalid amount of ${currencyUnit}` } })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    }
    await currency.add(target.id, -wager);
    const result = random.int(min = 1, max = 6);
    switch (result) {
        case 1:
        case 2:
        case 3:
            winning = 0;
            break;
        case 4:
            break;
        case 5:
            winning = wager * 2;
            break;
        case 6:
            winning = wager * 4;
            break;
        default:
    }
    await currency.add(target.id, +winning);
    if ([1, 2, 3].indexOf(result) > -1) {
        return message.channel
            .send({
                embed: {
                    description: `You bet **${wager}** ${currencyUnit}\nIt's a **${result}** 🎲!\n` +
                        `Sorry **${target.username}**, you lost.\n` +
                        `Your current balance is **${currency.getBalance(target.id)}** ${currencyUnit}`
                }
            })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    } else if ([5, 6].indexOf(result) > -1) {
        return message.channel
            .send({
                embed: {
                    description: `You bet **${wager}** ${currencyUnit}\n` +
                        `It's a **${result}** 🎲!\nWow **${target.username}**, you won ${winning} ${currencyUnit}!\n` +
                        `Your current balance is **${currency.getBalance(target.id)}** ${currencyUnit}`
                }
            })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    } else {
        return message.channel
            .send({
                embed: {
                    description: `You bet **${wager}** ${currencyUnit}\n` +
                        `It's a **${result}** 🎲!\nWell **${target.username}**, you won back your ${winning} ${currencyUnit}!\n` +
                        `Your current balance is **${currency.getBalance(target.id)}** ${currencyUnit}`
                }
            })
            .then(msg => {
                setTimeout(() => msg.delete(), msgExpireTime)
            })
            .catch(console.error);
    }
}