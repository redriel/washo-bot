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
        shop.upsert({ name: 'Jukebox Coin', cost: 100 }),
    ];
    await Promise.all(shop_items);
    console.log('Database synced');
    sequelize.close();
}).catch(console.error);