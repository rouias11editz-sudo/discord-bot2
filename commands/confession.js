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
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        if (sub === "post") {

            const modal = require("../handlers/openConfessionModal");
            return modal(interaction);

        }

        if (sub === "wizard") {

            const wizard = require("../handlers/confessionWizard");
            return wizard(interaction);

        }

    }
};
