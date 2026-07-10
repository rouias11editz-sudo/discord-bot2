const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confession")
        .setDescription("Anonymous confession system")

        .addSubcommand(sub =>
            sub
                .setName("post")
                .setDescription("Create an anonymous confession")
        )

        .addSubcommand(sub =>
            sub
                .setName("wizard")
                .setDescription("Configure the confession system")
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        // ==========================
        // Anyone can post
        // ==========================

        if (sub === "post") {

            const modal = require("../handlers/openConfessionModal");
            return modal(interaction);

        }

        // ==========================
        // Admin only
        // ==========================

        if (sub === "wizard") {

            if (
                !interaction.memberPermissions.has(
                    PermissionFlagsBits.Administrator
                )
            ) {
                return interaction.reply({
                    content: "❌ Only server administrators can use this command.",
                    ephemeral: true
                });
            }

            const wizard = require("../handlers/confessionWizard");
            return wizard(interaction);

        }

    }
};
