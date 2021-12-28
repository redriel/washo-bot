const fs = require('fs');
const mp3Duration = require('mp3-duration');
const humanizeDuration = require('humanize-duration');
const { defaultJukeboxVolume } = require('./../config.json');
const { users } = require('./../db_schema');
const { msgExpireTime } = require('./../config.json');
let currentVolume = defaultJukeboxVolume;

module.exports = {
    name: 'jukebox',
    aliases: ['j', 'jbox'],
    description: 'Play the old classic Midnight, the Stars and You',
    async execute(message, args) {
        const target = message.author;
        const mp3FileDuration = await mp3Duration('resources/midnight.mp3') * 1000;
        const user = await users.findOne({ where: { user_id: target.id } });
        if (!user) {
            return message.channel
                .send({
                    embed: {
                        description: `**${target.username}**, you are not registered.\n` +
                            `Please insert the command \`.register\``
                    }
                })
                .then(msg => {
                    setTimeout(() => msg.delete(), msgExpireTime)
                })
                .catch(console.error);
        }
        const items = await user.getItems();
        const coin = await items.filter(i => i.item.name == `jukebox coin`)[0];
        if (coin == null || coin == undefined || coin.amount < 1) {
            return message.channel.send({
                embed: {
                    description: `Sorry ${target.username}, you don't have a \`jukebox coin\`!\n` +
                        `You can buy one from the shop!\n` +
                        `To see what's on sale, please digit \`.shop\`\n` +
                        `You can buy an item by typing \`.buy [id/name]\``
                }
            });
        }
        if (message.member.voice.channel) {
            await user.removeItem(coin);
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(fs.createReadStream('resources/midnight.mp3'), { currentVolume: 0.4 });
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️', '🔉', '🔊'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            dispatcher.on('start', () => {
                message.channel.send({
                    embed: {
                        description: `Now playing an old time classic  📻\n` +
                            `Duration: **${humanizeDuration(mp3FileDuration)}**\n`
                    }
                }).then(msg => {
                    msg.react('⏸️');
                    msg.react('▶️');
                    msg.react('⏹️');
                    msg.react('🔉');
                    msg.react('🔊');
                    setTimeout(() => msg.delete(), mp3FileDuration + 1000);
                    //msg.delete({ timeout: mp3FileDuration + 1000 });
                    const collector = msg.createReactionCollector(filter, { time: mp3FileDuration });
                    collector.on('collect', r => {
                        switch (r.emoji.name) {
                            case '⏸️':
                                dispatcher.pause(true);
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            case '▶️':
                                dispatcher.resume();
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            case '⏹️':
                                connection.disconnect();
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                msg.delete();
                                break;
                            case '🔉':
                                currentVolume > 0.25 ? currentVolume -= 0.2 : currentVolume;
                                dispatcher.setVolume(currentVolume);
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            case '🔊':
                                currentVolume < 1.75 ? currentVolume += 0.2 : currentVolume;
                                dispatcher.setVolume(currentVolume);
                                r.users.remove(r.users.cache.filter(u => !u.bot).first());
                                break;
                            default: r.users.remove(r.users.cache.filter(u => !u.bot).first());
                        }
                    });
                });
            });
            dispatcher.on('finish', () => {
                connection.disconnect();
            });
            dispatcher.on('error', console.error);
        } else {
            return message.channel
                .send(({ embed: { description: `No one is listening, and I'm feeling lazy.` } }))
                .then(msg => {
                    setTimeout(() => msg.delete(), mp3FileDuration)
                })
                .catch(console.error);
        }
    },
};