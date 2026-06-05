const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID; // Event announcements
const ROLE_ID = process.env.ROLE_ID; // Role ping for events
const COUNTDOWN_CHANNEL_ID = process.env.COUNTDOWN_CHANNEL_ID; // Countdown channel

const events = [
    "🌱 Plant Rush Event",
    "🚛 Trucker Event",
    "🐝 Queen Bee Event",
    "👽 Alien Event"
];

let eventIndex = 0;
let lastCycle = -1;
let countdownEnded = false;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // =================================
    // 15-MINUTE EVENT ROTATION
    // =================================
    setInterval(async () => {
        try {
            const now = new Date();

            const cycle = Math.floor(
                Date.now() / (15 * 60 * 1000)
            );

            if (cycle === lastCycle) return;

            if (
                now.getMinutes() % 15 === 0 &&
                now.getSeconds() < 10
            ) {
                lastCycle = cycle;

                const channel =
                    await client.channels.fetch(CHANNEL_ID);

                const eventName = events[eventIndex];

                eventIndex =
                    (eventIndex + 1) % events.length;

                await channel.send(
                    `<@&${ROLE_ID}> ${eventName} is ACTIVE!`
                );

                console.log(`Sent: ${eventName}`);
            }
        } catch (error) {
            console.error("Event Error:", error);
        }
    }, 1000);

    // =================================
    // COUNTDOWN TO SATURDAY 7 PM UK
    // =================================
    async function updateCountdown() {
        try {
            const countdownChannel =
                await client.channels.fetch(
                    COUNTDOWN_CHANNEL_ID
                );

            const announceChannel =
                await client.channels.fetch(
                    CHANNEL_ID
                );

            // Saturday 7 PM UK time
            const target =
                new Date("2026-06-06T19:00:00+01:00");

            const diff =
                target.getTime() - Date.now();

            if (diff <= 0) {

                if (!countdownEnded) {
                    countdownEnded = true;

                    await announceChannel.send(
                        "@everyone 🎉 It's now 7 PM UK time!"
                    );

                    console.log(
                        "Countdown completed."
                    );
                }

                if (
                    countdownChannel.name !==
                    "⏳ LIVE NOW"
                ) {
                    await countdownChannel.setName(
                        "⏳ LIVE NOW"
                    );
                }

                return;
            }

            const days = Math.floor(
                diff / 86400000
            );

            const hours = Math.floor(
                (diff % 86400000) / 3600000
            );

            const minutes = Math.floor(
                (diff % 3600000) / 60000
            );

            const newName =
                `⏳ ${days}d ${hours}h ${minutes}m`;

            if (
                countdownChannel.name !== newName
            ) {
                await countdownChannel.setName(
                    newName
                );

                console.log(
                    `Countdown updated: ${newName}`
                );
            }
        } catch (error) {
            console.error(
                "Countdown Error:",
                error
            );
        }
    }

    // Run immediately
    updateCountdown();

    // Update every 10 minutes
    setInterval(
        updateCountdown,
        10 * 60 * 1000
    );
});

client.login(TOKEN);

Required .env:

TOKEN=YOUR_BOT_TOKEN
CHANNEL_ID=123456789012345678
ROLE_ID=123456789012345678
COUNTDOWN_CHANNEL_ID=123456789012345678
