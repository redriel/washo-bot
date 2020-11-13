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
            return message.channel.send(`**${target.tag}**, you are already registered.`)
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        } else {
            const newUser = await users.create({ user_id: target.id, balance: startingCurrency });
            newUser.save();
            return message.channel
                .send(`**${target.tag}**, thank you for registering!.\nAs a thank you, here's **10** ${currencyUnit}!\nYou can see your balance anytime by typing the command \`.balance\``)
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};