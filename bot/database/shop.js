module.exports = (sequelize, DataTypes) => {
	return sequelize.define('shop', {
		// id: {
		// 	type: DataTypes.INTEGER,
		// 	primaryKey: true,
		// },
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		}
	}, {
		timestamps: false,
	});
};