const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ChannelType
} = require("discord.js");

const db = require("../utils/database");

module.exports = async (interaction) => {

    // ===========================================
    // Add Confession
    // ===========================================

    if (interaction.customId === "confession_add") {

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

        return interaction.showModal(modal);

    }

    // ===========================================
    // Reply
    // ===========================================

    if (interaction.customId.startsWith("confession_reply_")) {

        const id = Number(
            interaction.customId.split("_")[2]
        );

        const modal = new ModalBuilder()
            .setCustomId(`reply_modal_${id}`)
            .setTitle(`Reply to Confession #${id}`);

        const reply = new TextInputBuilder()
            .setCustomId("reply_text")
            .setLabel("Anonymous reply")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(2000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reply)
        );

        return interaction.showModal(modal);

    }

    // ===========================================
    // Report
    // ===========================================

    if (interaction.customId.startsWith("confession_report_")) {

        const id = Number(
            interaction.customId.split("_")[2]
        );

        const confession = db.getConfession(id);

        if (!confession) {

            return interaction.reply({
                content: "❌ Confession not found.",
                ephemeral: true
            });

        }

        db.addReport(id, interaction.user.id);

        return interaction.reply({
            content:
                "✅ Thank you. The moderators have been notified.",
            ephemeral: true
        });

    }

};
