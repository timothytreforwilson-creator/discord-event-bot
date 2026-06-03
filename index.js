const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ROLE_ID = process.env.ROLE_ID;

// NEW ORDER YOU REQUESTED
const events = [
    "🚛 Trucker Event",
    "🐝 Queen Bee Event",
    "👽 Alien Event",
    "🌱 Plant Rush Event"
];

let eventIndex = 0;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

function getTimeUntilNextEvent() {
    const now = new Date();

    const next = new Date(now);
    next.setSeconds(0);
    next.setMilliseconds(0);

    const nextMinute = Math.ceil(now.getMinutes() / 15) * 15;

    if (nextMinute === 60) {
        next.setHours(next.getHours() + 1);
        next.setMinutes(0);
    } else {
        next.setMinutes(nextMinute);
    }

    return next - now;
}

let lastPing = null;

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);

    setInterval(async () => {
        const diff = getTimeUntilNextEvent();

        const now = new Date();
        const minuteKey = now.getHours() + ":" + now.getMinutes();

        // trigger ONLY once per 15-min cycle
        if (diff < 1000 && lastPing !== minuteKey) {
            lastPing = minuteKey;

            const channel = await client.channels.fetch(CHANNEL_ID);

            const eventName = events[eventIndex];
            eventIndex = (eventIndex + 1) % events.length;

            // ONLY ONE LINE SENT
            channel.send(`<@&${ROLE_ID}> ${eventName} is ACTIVE!`);
        }
    }, 1000);
});

client.login(TOKEN);
