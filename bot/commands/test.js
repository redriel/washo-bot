const { msgExpireTime } = require('./../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'test',
	aliases: ['28', 't'],
	description: 'Ping!',
	execute(message, args) {
		//const filter = (reaction, user) => ['⬆️', '⬇️'].indexOf(reaction.emoji.name) > -1 && !user.bot;
		const msg = "First Header | Second Header\n------------ | -------------\nContent from cell 1 | Content from cell 2\nContent in the first column | Content in the second column";

		message.channel.send({ embed: {
			title:'text',
			files: [{
				attachment: './../bot/resources/test.html',
				name: 'test.html'
			  }]
		} });

		message.channel.send({
			embed
		});

		// 		First Header | Second Header
		// ------------ | -------------
		// Content from cell 1 | Content from cell 2
		// Content in the first column | Content in the second column
		// .send('▂▃▅▇█▓▒░۩۞۩   **S A M A R I O**   ۩۞۩░▒▓█▇▅▃▂')
		// .then(msg => {
		// 	msg.react('⬆️');
		// 	msg.react('⬇️');
		// 	msg.delete({ timeout: msgExpireTime });
		// 	const collector = msg.createReactionCollector(filter, { time: msgExpireTime });
		// 	collector.on('collect', r => {
		// 		switch (r.emoji.name) {
		// 			case '⬆️':
		// 				r.users.remove(r.users.cache.filter(u => !u.bot).first());
		// 				break;
		// 			case '⬇️':
		// 				r.users.remove(r.users.cache.filter(u => !u.bot).first());
		// 				break;
		// 			default:
		// 		}
		// 	})
		// })
		// .catch(console.error);
	},
};

