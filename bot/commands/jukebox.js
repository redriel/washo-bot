const fs = require('fs');
const mp3Duration = require('mp3-duration');
const humanizeDuration = require('humanize-duration');
const { defaultJukeboxVolume } = require('./../config.json');
let currentVolume = defaultJukeboxVolume;

module.exports = {
    name: 'jukebox',
    aliases: ['j', 'jbox'],
    description: 'Play the old classic Midnight, the Stars and You',
    async execute(message, args) {
        const mp3FileDuration = await mp3Duration('resources/midnight.mp3') * 1000;
        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(fs.createReadStream('resources/midnight.mp3'), { currentVolume: 0.35 });
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️', '🔉', '🔊'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            dispatcher.on('start', () => {
                'Now playing an old time classic 📻'
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
                    msg.delete({ timeout: mp3FileDuration + 1000 });
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
                .send(({ embed: { description:`No one is listening, and I'm feeling lazy.`}}))
                .then(msg => { msg.delete({ timeout: mp3FileDuration }) })
                .catch(console.error);
        }
    },
};