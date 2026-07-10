require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
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

    const command = require(path.join(commandsPath, file));

    if (!command.data || !command.execute) {
        console.log(`⚠️ Invalid command skipped: ${file}`);
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

        // ==========================
        // Slash Commands
        // ==========================

        if (interaction.isChatInputCommand()) {

            console.log("CMD:", interaction.commandName);

            const command = client.commands.get(
                interaction.commandName
            );

            if (!command) {
                return interaction.reply({
                    content: "❌ Command not found.",
                    ephemeral: true
                });
            }

            return await command.execute(interaction);
        }

        // ==========================
        // Modals
        // ==========================

        if (interaction.isModalSubmit()) {

            console.log("MODAL:", interaction.customId);

            const modalHandler = require("./handlers/modals");

            return await modalHandler(interaction);

        }

        // ==========================
        // Select Menus
        // ==========================

        if (interaction.isAnySelectMenu()) {

            console.log("SELECT:", interaction.customId);

            const selectHandler = require("./handlers/selectMenus");

            return await selectHandler(interaction);

        }

        // ==========================
        // Buttons
        // ==========================

        if (interaction.isButton()) {

            console.log("BUTTON:", interaction.customId);

            const buttonHandler = require("./handlers/buttons");

            return await buttonHandler(interaction);

        }

    } catch (err) {

        console.error("❌ FULL ERROR:");
        console.error(err);
        console.error(err.stack);

        const msg = {
            content: "❌ Something went wrong while processing this interaction.",
            ephemeral: true
        };

        try {

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(msg);
            } else {
                await interaction.reply(msg);
            }

        } catch {}

    }

});


// ==========================
// Login
// ==========================

client.login(process.env.TOKEN);
