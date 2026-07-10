const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = async (interaction) => {

    const modal = new ModalBuilder()
        .setCustomId("confession_modal")
        .setTitle("Anonymous Confession");

    const confession = new TextInputBuilder()
        .setCustomId("confession_text")
        .setLabel("Your confession")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(2000);

    modal.addComponents(
        new ActionRowBuilder().addComponents(confession)
    );

    await interaction.showModal(modal);

};
