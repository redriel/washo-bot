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
 * @version  0.2.0.6
 */

const fs = require('fs');
const { createReadStream } = require('fs');
const { join } = require('path');
const Discord = require('discord.js');
const { prefix, msgExpireTime } = require('./config.json');
const { token } = require('./token.json');
const LOCAL_TOKEN = token;
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const cooldowns = new Discord.Collection();
const figlet = require('figlet');
client.commands = new Discord.Collection();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Console log reports the successful log in.
client.once('ready', async () => {
	console.log(figlet.textSync('washo.js', {
		font: 'Ogre',
		horizontalLayout: 'default',
		verticalLayout: 'default',
		width: 80,
		whitespaceBreak: true
	}));
	console.log(`${client.user.tag} is up and running.`);
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
		message.delete();
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
			const connection = joinVoiceChannel({
				channelId: newState.member.voice.channelId,
				guildId: newState.member.voice.channel.guildId,
				adapterCreator: newState.member.voice.channel.guild.voiceAdapterCreator,
			});
			const audioPlayer = createAudioPlayer();
			const resource = createAudioResource(createReadStream(join(__dirname, 'resources/melacta.ogg')), {
				inlineVolume: true
			});
			resource.volume.setVolume(1);
			connection.subscribe(audioPlayer);
			audioPlayer.play(resource);

		}
	} catch (e) { console.error(e) }
});

process
	.on('unhandledRejection', (reason, p) => {
		console.error(reason, 'Unhandled Rejection at Promise', p);
	})
	.on('SIGINT', function () {
		console.log(`Gracefully ending ${client.user.tag}. Bye!`);
		process.exit(0);
	})
	.on('uncaughtException', err => {
		console.error(err, 'Uncaught Exception thrown');
		process.exit(1);
	});

	console.log('USING LOCAL TOKEN TO CONNECT');
	client.login(LOCAL_TOKEN);