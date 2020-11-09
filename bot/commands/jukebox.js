const fs = require('fs');

module.exports = {
    name: 'jukebox',
    aliases: ['j', 'jbox'],
    description: 'Play the old classic Midnight, the Stars and You',
    async execute(message, args) {

        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            // const userVolume = args.find(a => parseInt(a));
            // console.log(userVolume);
            const dispatcher = connection.play(fs.createReadStream('resources/midnight.mp3'), { volume : 0.35 });
            dispatcher.on('start', () => {
                return message.channel.send(`Now playing an old time classic.`);
            });
            dispatcher.on('finish', () => {
                connection.disconnect();
            });
            dispatcher.on('error', console.error);
        } else {
            return message.channel.send(`No one in the voice channel, my music would be wasted.`);
        }
    },
};