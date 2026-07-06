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

const commandFiles = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command);

}

// ==========================
// Ready
// ==========================

client.once("ready", () => {

    console.log(`✅ Logged in as ${client.user.tag}`);

});

// ==========================
// Interactions
// ==========================

client.on("interactionCreate", async interaction => {

    try {

        // Slash Commands

        if (interaction.isChatInputCommand()) {

            const command =
                client.commands.get(interaction.commandName);

            if (!command) return;

            return await command.execute(interaction);

        }

        // Modals

        if (interaction.isModalSubmit()) {

            const modalHandler =
                require("./handlers/modals");

            return await modalHandler(interaction);

        }

        // Buttons

        if (interaction.isButton()) {

            const buttonHandler =
                require("./handlers/buttons");

            return await buttonHandler(interaction);

        }

    }

    catch (err) {

        console.error(err);

        if (
            interaction.deferred ||
            interaction.replied
        ) {

            await interaction.editReply({
                content:
                    "❌ ermm sum went wrong redo."
            });

        }

        else {

            await interaction.reply({

                content:
                    "❌ ermm sum went wrong redo.",

                ephemeral: true

            });

        }

    }

});

client.login(process.env.TOKEN);
