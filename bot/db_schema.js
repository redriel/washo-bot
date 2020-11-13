const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'db.sqlite',
});

const users = require('./database/users')(sequelize, Sequelize.DataTypes);
const shop = require('./database/shop')(sequelize, Sequelize.DataTypes);
const inventories = require('./database/inventories')(sequelize, Sequelize.DataTypes);

inventories.belongsTo(shop, { foreignKey: 'item_id', as: 'item' });

users.prototype.addItem = async function(item) {
	const userItem = await inventories.findOne({
		where: { user_id: this.user_id, item_id: item.id },
	});

	if (userItem) {
		userItem.amount += 1;
		return userItem.save();
	}

	return inventories.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
};

users.prototype.getItems = function() {
	return inventories.findAll({
		where: { user_id: this.user_id },
		include: ['item'],
	});
};

module.exports = { users, shop, inventories };