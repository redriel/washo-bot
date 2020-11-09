module.exports = {
	name: 'ping',
	aliases: ['test'],
	description: 'Ping!',
	execute(message, args) {
		message.channel.send('Pong.');
	},
};