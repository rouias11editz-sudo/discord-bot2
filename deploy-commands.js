const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

// ==========================
// Load command files safely
// ==========================

const commands = [];

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.data.toJSON) {
        console.log(`⚠️ Skipping invalid command: ${file}`);
        continue;
    }

    commands.push(command.data.toJSON());
}

// ==========================
// REST setup
// ==========================

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// ==========================
// Deploy commands
// ==========================

(async () => {
    try {
        console.log("⏳ Clearing old slash commands...");

        // Clear old commands (important fix)
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: [] }
        );

        console.log("⏳ Registering new slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log("✅ Slash commands registered successfully!");
        console.log(`📦 Loaded commands: ${commands.length}`);
    } catch (error) {
        console.error("❌ Error deploying commands:", error);
    }
})();
