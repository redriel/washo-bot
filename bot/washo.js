const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
// const ytdl = require('ytdl-core');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Console log reports the successful log in.
client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// Every time a message is typed, this procedure starts.
client.on('message', async message => {

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
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
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
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
		message.reply('There was an error trying to execute that command!');
	}

});

// // Every time someone enters the voice channel, the bot checks this function
// client.on('voiceStateUpdate', (oldMember, newMember) => {
// 	let newUserChannel = newMember.voiceChannel
// 	let oldUserChannel = oldMember.voiceChannel

// 	// Here we check if an user enters
// 	if (oldUserChannel === undefined && newUserChannel !== undefined) {
// 		const voiceChannel = client.channels.get("113743932361277443");
// 		if (newMember.id != "666607347128467477") {
// 			const date = new Date();
// 			const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
// 			console.log(`${newMember.user.username} has joined the voice channel at ${date.getHours()}:${minutes}.`);
// 		}
// 		voiceChannel.join().then(connection => {
// 			const stream = ('audio/melacta.mp3');
// 			const dispatcher = connection.playStream(stream);
// 		});

// 	}

// 	// Here we check when an user leaves
// 	else if (newUserChannel === undefined) {
// 		const voiceChannel = client.channels.get("113743932361277443");
// 		if (oldMember.id != "666607347128467477") {
// 			const date = new Date();
// 			const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
// 			console.log(`${newMember.user.username} has left the voice channel at ${date.getHours()}:${minutes}.`);
// 		}
// 		if (oldMember.id != "666607347128467477") {
// 			voiceChannel.join().then(connection => {
// 				const stream = ('audio/horn.mp3');
// 				const dispatcher = connection.playStream(stream);
// 			});
// 		}
// 	}
//})

// process.on('unhandledRejection', error => {
// 	console.log('---------------------------');
// 	console.error('UNHANDLED PROMISE REJECTION:', error);
// });

// Actual log in of the bot with its access token
client.login(token);