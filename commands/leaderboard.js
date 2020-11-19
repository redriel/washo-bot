const { currencyUnit, msgExpireTime } = require('./../config.json');
const { users } = require('./../db_schema');
const Discord = require('discord.js');
let currency = new Discord.Collection();

Reflect.defineProperty(currency, 'getBalance', {
    value: function getBalance(id) {
        const user = currency.get(id);
        return user ? user.balance : 0;
    },
});

async function loadBalance(id) {
    const storedBalances = await users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));
}

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'leader', 'board'],
    description: 'Show the users everyone balanace',
    async execute(message, args) {
        await loadBalance();
        return message.channel.send(
            currency.sort((a, b) => b.balance - a.balance)
                .filter(user => message.client.users.cache.has(user.user_id))
                .first(10)
                .map((user, position) => `#${position + 1} ${(message.client.users.cache.get(user.user_id).username)}: ${user.balance} ${currencyUnit}`)
                .join('\n'),
            { code: true })
            .then(msg => { msg.delete({ timeout: msgExpireTime }) })
            .catch(console.error);
    },
};