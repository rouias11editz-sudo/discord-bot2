const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confession")
        .setDescription("Send an anonymous confession"),

    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId("confession_modal")
            .setTitle("Anonymous Confession");

        const confession = new TextInputBuilder()
            .setCustomId("confession_text")
            .setLabel("Your confession")
            .setPlaceholder("Type your confession here...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(confession)
        );

        await interaction.showModal(modal);
    }
};
