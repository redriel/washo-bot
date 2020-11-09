const { msgExpire } = require('./../config.json');

module.exports = {
	name: 'ping',
	aliases: ['test'],
	description: 'Ping!',
	execute(message, args) {
		message.channel
			.send('Pong.')
			.then(msg => { msg.delete({ timeout: msgExpire }) })
			.catch(console.error);
	},
};