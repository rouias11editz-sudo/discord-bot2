require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

// ==========================
// Load Commands
// ==========================

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.data.name) {
        console.warn(`⚠️ Skipping invalid command file: ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);
}

// ==========================
// Ready Event
// ==========================

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// ==========================
// Interaction Handler
// ==========================

client.on("interactionCreate", async interaction => {
    try {

        // ======================
        // Slash Commands
        // ======================
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({
                    content: "❌ Command not found.",
                    ephemeral: true
                });
            }

            return await command.execute(interaction);
        }

        // ======================
        // Modals
        // ======================
        if (interaction.isModalSubmit()) {
            const modalHandler = require("./handlers/modals");
            return await modalHandler(interaction);
        }

        // ======================
        // Buttons
        // ======================
        if (interaction.isButton()) {
            const buttonHandler = require("./handlers/buttons");
            return await buttonHandler(interaction);
        }

    } catch (err) {
        console.error("❌ Interaction error:", err);

        const msg = {
            content: "❌ Something went wrong.",
            ephemeral: true
        };

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(msg);
        } else {
            await interaction.reply(msg);
        }
    }
});

// ==========================
// Login
// ==========================

client.login(process.env.TOKEN);
