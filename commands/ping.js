const { msgExpireTime } = require('./../config.json');

module.exports = {
	name: 'ping',
	aliases: ['test'],
	description: 'Ping!',
	execute(message, args) {
		message.channel
			.send({ embeds: [{ description: 'Pong.' }] })
			.then(msg => {
				setTimeout(() => msg.delete(), msgExpireTime)
			})
			.catch(console.error);
	},
};