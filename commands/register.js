const { currencyUnit, msgExpireTime, startingCurrency } = require('./../config.json');
const { users } = require('./../db_schema');
const Discord = require('discord.js');
let currency = new Discord.Collection();

module.exports = {
    name: 'register',
    aliases: [],
    description: 'Register the user to the database',
    async execute(message, args) {
        const target = message.author;
        const user = await users.findOne({ where: { user_id: target.id } });
        if (user) {
            return message.channel
                .send({
                    embeds: [{
                        description: `**${target.username}**, you are already registered.`
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        } else {
            const newUser = await users.create({ user_id: target.id, balance: startingCurrency });
            newUser.save();
            return message.channel
                .send({
                    embeds: [{
                        description: `**${target.username}**, thank you for registering!.\n` +
                            `As a thank you, here's **${startingCurrency}** ${currencyUnit}!\n` +
                            `You can see your balance anytime by typing the command \`.balance\``
                    }]
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
    },
};