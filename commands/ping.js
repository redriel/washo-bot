module.exports = {
	name: 'ping',
	aliases: ['test'],
	description: 'Ping!',
	execute(message) {
		message.channel
			.send({ embeds: [{ description: 'Pong.' }] })
			.catch(console.error);
	},
};