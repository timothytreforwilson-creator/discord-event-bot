const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ROLE_ID = process.env.ROLE_ID;

const events = [
"👽 Alien Event",
"🌱 Plant Rush Event",
"🚛 Trucker Event",
"🐝 Queen Bee Event"
];

let eventIndex = 0;

// Stores the last event cycle that was sent
let lastCycle = null;

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
console.log(`Logged in as ${client.user.tag}`);

```
setInterval(async () => {
    try {
        const now = new Date();

        // Current 15-minute cycle
        const cycle = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${Math.floor(now.getMinutes() / 15)}`;

        // Trigger during the first 10 seconds of a cycle
        if (now.getMinutes() % 15 === 0 && now.getSeconds() < 10) {

            // Already sent for this cycle
            if (cycle === lastCycle) return;

            lastCycle = cycle;

            const channel = await client.channels.fetch(CHANNEL_ID);

            const eventName = events[eventIndex];
            eventIndex = (eventIndex + 1) % events.length;

            await channel.send(
                `<@&${ROLE_ID}> ${eventName} is ACTIVE!`
            );

            console.log(`Sent: ${eventName}`);
        }
    } catch (err) {
        console.error(err);
    }
}, 1000);
```

});

client.login(TOKEN);
