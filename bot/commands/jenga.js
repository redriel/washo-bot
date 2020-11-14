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
    name: 'jenga',
    aliases: [],
    description: 'Give another user credits',
    async execute(message, args) {

        const user = message.author;
        const userDb = await users.findOne({ where: { user_id: user.id } });

        if (user == null || userDb == undefined) {
            return message.channel
                .send({
                    embed: {
                        description: `**${user.username}**, either you or the receiver of the donation are not registered.\n` +
                            `To register, please insert the command \`.register\``
                    }
                })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
        if (user.username != 'Redriel') {
            return message.channel
                .send({
                    embed: {
                        description: `I'm sorry **${user.username}**, only Redriel can hold the power of this command.`
                    }
                })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
        await loadBalance(user.id);
        await currency.add(user.id, +1000);

        return message.channel
            .send({
                embed: {
                    description: `That's a secret 😉`
                }
            })
            .then(msg => {
                msg.delete({ timeout: msgExpireTime })
            })
            .catch(console.error);
    },
};