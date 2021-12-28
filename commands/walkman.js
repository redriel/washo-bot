const { defaultJukeboxVolume } = require('./../config.json');
const random = require('random');

let currentVolume = defaultJukeboxVolume;

module.exports = {
    name: 'walkman',
    aliases: ['w', 'wk'],
    description: 'Play the virtual walkman with online tracks',
    async execute(message, args) {
        if (message.member.voice.channel) {
            let track = '';
            !args.length? track = 'https://www.mboxdrive.com/chuck.mp3' : track = args[0];
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(`${track}`, { currentVolume: 0.4 });
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️', '🔉', '🔊'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            dispatcher.on('start', () => {
                message.channel.send({
                    embed: {
                        description: `Now playing **some random shit**  🎙️\n`
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
                .then(msg => {
                    setTimeout(() => msg.delete(), mp3FileDuration)
                })
                .catch(console.error);
        }
    },
};