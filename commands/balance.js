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
    const storedBalances = await users.findAll({ where: { user_id: id } });
    storedBalances.forEach(b => currency.set(b.user_id, b));
}

module.exports = {
    name: 'balance',
    aliases: ['bal'],
    description: 'Show the users its balanace',
    async execute(message, args) {
        const target = message.author;
        const user = await users.findOne({ where: { user_id: target.id } });
        if (user) {
            await loadBalance(target.id);
            return message.channel.send(({ embed: { description: `**${target.username}**, you have ${currency.getBalance(target.id)} ${currencyUnit}` } }))
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        } else {
            return message.channel
                .send(({
                    embed: {
                        description: `**${target.username}**, you are not registered.\n` +
                            `Please insert the command \`.register\``
                    }
                }))
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    },
};