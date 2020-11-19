const { currencyUnit, msgExpireTime } = require('./../config.json');
const { shop } = require('./../db_schema');
const { table } = require('table');


module.exports = {
    name: 'shop',
    aliases: ['market'],
    description: 'Show the user the common shop',
    async execute(message, args) {
        const items = await shop.findAll();
        if (items == null || items == undefined) {
            return message.channel.send({ embed: { description: `Apparently, there are no items in the shop. Must be thieves.` } })
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        } else {
            data = [
                [`ID`, `NAME`, `COST`, `QTY`],
            ];
            items.forEach(i => {
                data.push([i.id, i.name, i.cost, i.quantity ? i.quantity : `∞`]);
            });
            const output = table(data);
            return message.channel
                .send(`${output}`, {code: true})
                .then(msg => {
                    msg.delete({ timeout: msgExpireTime })
                })
                .catch(console.error);
        }
    },
};