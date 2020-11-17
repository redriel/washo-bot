const { defaultJukeboxVolume } = require('./../config.json');
const random = require('random');
let track = '';

let currentVolume = defaultJukeboxVolume;

module.exports = {
    name: 'walkman',
    aliases: ['w', 'wk'],
    description: 'Play the virtual walkman with online tracks',
    async execute(message, args) {
        if (message.member.voice.channel) {
            const choice = random.int(min = 1, max = 10);
            switch (choice) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10: track = 'chuck'
                    break;
                default:
            }
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(`https://www.mboxdrive.com/${track}.mp3`, { currentVolume: 0.4 });
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️', '🔉', '🔊'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            dispatcher.on('start', () => {
                message.channel.send({
                    embed: {
                        description: `Now playing **some random shit**  📻\n`
                    }
                }).then(msg => {
                    msg.react('⏸️');
                    msg.react('▶️');
                    msg.react('⏹️');
                    msg.react('🔉');
                    msg.react('🔊');
                    const collector = msg.createReactionCollector(filter);
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
                .then(msg => { msg.delete({ timeout: mp3FileDuration }) })
                .catch(console.error);
        }
    },
};