const ytdl = require('ytdl-core-discord');
const { msgExpire } = require('./../config.json');

module.exports = {
    name: 'youtube',
    aliases: ['y', 'play'],
    description: 'Play music from youtube',
    async execute(message, args) {
        try {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(await ytdl(args[0]), { type: 'opus', volume: 0.5 });
            const songInfo = await ytdl.getInfo(args[0]);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                length: songInfo.videoDetails.lengthSeconds
            };
            const filter = (reaction, user) => ['⏸️', '▶️', '⏹️'].indexOf(reaction.emoji.name) > -1 && !user.bot;
            dispatcher.on('start', () => {
                message.channel.send(`Now playing: **${song.title}**`).then(msg => {
                    msg.react('⏸️');
                    msg.react('▶️');
                    msg.react('⏹️');
                    const collector = msg.createReactionCollector(filter, { time: song.length * 1000 });
                    collector.on('collect', r => {
                        switch (r.emoji.name) {
                            case '⏸️':
                                dispatcher.pause(true);
                                break;
                            case '▶️':
                                dispatcher.resume();
                                break;
                            case '⏹️':
                                connection.disconnect();
                                break;
                            default:
                        }
                    });
                });
            });
            dispatcher.on('finish', () => {
                connection.disconnect();
            });
            dispatcher.on('error', console.error);
        } catch (error) {
            console.error(error);
            return message.channel
                .then(msg => { msg.delete({ timeout: msgExpire }) })
                .send(`The URL ${args[0]} is invalid.`)
                .catch(console.error);
        }
    },
};