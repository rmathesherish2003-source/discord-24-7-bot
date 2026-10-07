const {
    Client,
    GatewayIntentBits,
    ChannelType
} = require("discord.js");

const {
    joinVoiceChannel,
    VoiceConnectionStatus
} = require("@discordjs/voice");

require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let connection;

async function connectToVoice() {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const channel = await guild.channels.fetch(process.env.VOICE_CHANNEL_ID);

        if (!channel || channel.type !== ChannelType.GuildVoice) {
            console.log("Voice channel not found!");
            return;
        }

        connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfMute: true,
            selfDeaf: true
        });

        console.log(`Joined voice channel: ${channel.name}`);
        console.log("Bot is now silent and connected.");

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log("Bot disconnected. Reconnecting...");

            setTimeout(() => {
                connectToVoice();
            }, 5000);
        });

    } catch (error) {
        console.error("Connection error:", error);

        setTimeout(() => {
            connectToVoice();
        }, 10000);
    }
}

client.once("clientReady", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await connectToVoice();
});

client.login(process.env.DISCORD_TOKEN);