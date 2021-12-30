/**
 * This is a JavaScript Discord BOT application.
 * It is built with the Discord.js (v13) framework. 
 * The washo.js file is the entry point of the application.
 * To run it locally launch the command 'node washo.js' or
 * 'nodemon washo.js' if you wish to autorestart on every edit.
 * 
 * 
 * @date 2021/12/29
 * @author redriel
 * @version  0.1.0.1
 */

//TODO fix shop and leaderboard embeds
//TODO: update the usage of embeds
//TODO: update the connection to the voice channel

const fs = require('fs');
const Discord = require('discord.js');
const { users, shop } = require('./db_schema');
const { prefix, msgExpireTime } = require('./config.json');
const { token } = require('./token.json');
const LOCAL_TOKEN = token;
const HEROKU_TOKEN = process.env.BOT_TOKEN;
const { joinVoiceChannel } = require('@discordjs/voice');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
// [v.0.0.2.5] Added intents to client for the new Discord update
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
let connection, voiceChannel = null;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Console log reports the successful log in.
client.once('ready', async () => {
	console.log(`${client.user.tag} is up and running.`);
	const storedBalances = await users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
});

// Every time a message is typed, this procedure starts.
client.on('messageCreate', async message => {

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message
			.reply('I can\'t execute that command inside DMs!')
			.then(msg => {
				setTimeout(() => msg.delete(), msgExpireTime)
			})
			.catch(console.error);
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel
			.send({ embed: { description: reply } })
			.then(msg => {
				setTimeout(() => msg.delete(), msgExpireTime)
			})
			.catch(console.error);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 2) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
				.then(msg => {
					setTimeout(() => msg.delete(), msgExpireTime)
				})
				.catch(console.error);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
		message.channel.bulkDelete(1, true).catch(err => {
			console.error(err);
		});
	} catch (error) {
		console.error(error);
		message.reply(`There was an error trying to execute the command \`${commandName}\`!`)
			.then(msg => {
				setTimeout(() => msg.delete(), msgExpireTime)
			})
			.catch(console.error);
	}

});

client.on('voiceStateUpdate', async (oldState, newState) => {
	try {
		if (newState.member.voice.channel && newState.id != client.user.id &&
			newState.member.voice.member) {

			// We check either if a user muted/unmuted or deafened/undeafened himself
			// In that case, we don't want the bot to play the greeting

			// [v0.0.2.5] Commenting this section to check if improves the reactiviness of the greetings

			// if (oldState.mute != newState.mute || oldState.selfMute != newState.selfMute ||
			// 	oldState.serverMute != newState.serverMute) {
			// 	return;
			// }
			// if (oldState.deaf != newState.deaf || oldState.selfDeaf != newState.selfDeaf ||
			// 	oldState.serverDeaf != newState.serverDeaf) {
			// 	return;
			// }

			connection = await newState.member.voice.channel.join();
			voiceChannel = newState.member.voice.channel;
			// [v0.0.2.5] de-commenting this for now
			const dispatcher = connection.play(fs.createReadStream('resources/melacta.ogg'), { volume: 1 });

			// [v0.0.2.5] commenting this for now
			// if (connection && connection.speaking.bitfield < 1) {
			// 	const dispatcher = connection.play(fs.createReadStream('resources/melacta.ogg'), { volume: 1 });
			// }

		} else if (oldState.member.voice.channel === null && oldState.id != client.user.id) {
			// [v0.0.2.5] commenting this for now
			// if (connection && connection.speaking.bitfield < 1) {
			// 	voiceChannel.join();
			// 	const dispatcher = connection.play(fs.createReadStream('resources/bye.ogg'), { volume: 1.25 });
			// }
			voiceChannel.join();
			const dispatcher = connection.play(fs.createReadStream('resources/bye.ogg'), { volume: 1.25 });
		}
	} catch (e) { console.error(e) }
});

process
	.on('unhandledRejection', (reason, p) => {
		console.error(reason, 'Unhandled Rejection at Promise', p);
	})
	.on('uncaughtException', err => {
		console.error(err, 'Uncaught Exception thrown');
		process.exit(1);
	});

if (typeof HEROKU_TOKEN === 'undefined') {
	console.log('USING LOCAL TOKEN TO CONNECT');
	client.login(LOCAL_TOKEN);
} else {
	console.log('USING HEROKU ENVIRONMENT TOKEN TO CONNECT');
	client.login(HEROKU_TOKEN);
}
