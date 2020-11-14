const { msgExpireTime } = require('./../config.json');

module.exports = {
	name: 'ping',
	aliases: ['test'],
	description: 'Ping!',
	execute(message, args) {
		message.channel
			.send(({ embed: { description:'Pong.'}}))
			.then(msg => { msg.delete({ timeout: msgExpireTime }) })
			.catch(console.error);
	},
};