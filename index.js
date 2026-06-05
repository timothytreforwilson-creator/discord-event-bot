const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ROLE_ID = process.env.ROLE_ID;
const COUNTDOWN_CHANNEL_ID = process.env.COUNTDOWN_CHANNEL_ID;

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

function getNextSaturday7PMUK() {
    const now = new Date();

    const ukNow = new Date(
        now.toLocaleString("en-GB", {
            timeZone: "Europe/London"
        })
    );

    const target = new Date(ukNow);

    const daysUntilSaturday =
        (6 - ukNow.getDay() + 7) % 7;

    target.setDate(target.getDate() + daysUntilSaturday);
    target.setHours(19, 0, 0, 0);

    // If already past Saturday 7 PM, go to next week
    if (target <= ukNow) {
        target.setDate(target.getDate() + 7);
    }

    return target;
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // -------------------------
    // EVENT ROTATION
    // -------------------------
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
        } catch (err) {
            console.error("Event Error:", err);
        }
    }, 1000);

    // -------------------------
    // COUNTDOWN CHANNEL
    // -------------------------
    const updateCountdown = async () => {
        try {
            const countdownChannel =
                await client.channels.fetch(
                    COUNTDOWN_CHANNEL_ID
                );

            const announceChannel =
                await client.channels.fetch(
                    CHANNEL_ID
                );

            if (!countdownChannel) return;

            const target = getNextSaturday7PMUK();
            const diff = target.getTime() - Date.now();

            if (diff <= 0) {
                if (!countdownEnded) {
                    countdownEnded = true;

                    await announceChannel.send(
                        "@everyone 🎉 The event has started!"
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

            countdownEnded = false;

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
        } catch (err) {
            console.error(
                "Countdown Error:",
                err
            );
        }
    };

    // Run immediately
    updateCountdown();

    // Update every 10 minutes
    setInterval(
        updateCountdown,
        10 * 60 * 1000
    );
});

client.login(TOKEN);
