const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'db.sqlite',
});

const shop = require('./database/shop')(sequelize, Sequelize.DataTypes);
const users = require('./database/users')(sequelize, Sequelize.DataTypes);
const inventories = require('./database/inventories')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    const shop_items = [
        shop.upsert({ name: 'jukebox coin', cost: 10, quantity: null, description: 'Used to play Jukebox' }),
        shop.upsert({ name: 'legendary sword', cost: 9999, quantity: 1, description: 'Symbol of true power' }),
    ];
    await Promise.all(shop_items);
    console.log('Database synced');
    sequelize.close();
}).catch(console.error);