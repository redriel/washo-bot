const { msgExpireTime } = require('./../config.json');

module.exports = {
	name: 'test',
	aliases: ['28', 't'],
	description: 'Ping!',
	execute(message, args) {
		const filter = (reaction, user) => ['⬆️', '⬇️'].indexOf(reaction.emoji.name) > -1 && !user.bot;
		message.channel
			.send('▂▃▅▇█▓▒░۩۞۩   **S A M A R I O**   ۩۞۩░▒▓█▇▅▃▂')
			.then(msg => {
				msg.react('⬆️');
				msg.react('⬇️');
				msg.delete({ timeout: msgExpireTime });
				const collector = msg.createReactionCollector(filter, { time: msgExpireTime });
				collector.on('collect', r => {
					switch (r.emoji.name) {
						case '⬆️':
							r.users.remove(r.users.cache.filter(u => !u.bot).first());
							break;
						case '⬇️':
							r.users.remove(r.users.cache.filter(u => !u.bot).first());
							break;
						default:
					}
				})
			})
			.catch(console.error);
	},
};

