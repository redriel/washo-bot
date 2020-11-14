const { currencyUnit, msgExpireTime } = require('./../config.json');
const { shop } = require('./../db_schema');

module.exports = {
    name: 'shop',
    aliases: ['market'],
    description: 'Show the user the common shop',
    async execute(message, args) {
        const items = await shop.findAll();
        if (items == null || items == undefined) {
            return message.channel.send(({ embed: { description:`Apparently, there are no items in the shop. Must be thieves.`}}))
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        } else {
            return message.channel.send(items.map(item => `${item.name}: ${item.cost} ${currencyUnit}`)
                .join('\n'), { code: true })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};