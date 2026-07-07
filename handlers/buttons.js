const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../utils/database");
const config = require("../config");

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
            .setPlaceholder("Type your confession here...")
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

        const confession = db.getConfession(id);

        if (!confession) {

            return interaction.reply({
                content: "❌ Confession not found.",
                ephemeral: true
            });

        }

        const modal = new ModalBuilder()
            .setCustomId(`reply_modal_${id}`)
            .setTitle(`Reply to Confession #${id}`);

        const reply = new TextInputBuilder()
            .setCustomId("reply_text")
            .setLabel("Anonymous Reply")
            .setPlaceholder("Write your anonymous reply...")
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

        if (db.hasReported(id, interaction.user.id)) {

            return interaction.reply({
                content: "⚠️ You have already reported this confession.",
                ephemeral: true
            });

        }

        db.addReport(id, interaction.user.id);

        try {

            const modChannel = await interaction.client.channels.fetch(
                config.modAlertChannel
            );

            if (modChannel) {

                const embed = new EmbedBuilder()
                    .setColor(config.embedColors.HIGH)
                    .setTitle("🚩 Confession Report")
                    .addFields(
                        {
                            name: "📝 Confession",
                            value: `#${id}`,
                            inline: true
                        },
                        {
                            name: "👤 Original Author",
                            value: `<@${confession.userId}>`,
                            inline: true
                        },
                        {
                            name: "🆔 Author ID",
                            value: confession.userId,
                            inline: true
                        },
                        {
                            name: "🚩 Reported By",
                            value: `<@${interaction.user.id}>`,
                            inline: true
                        },
                        {
                            name: "🆔lolll id author id",
                            value: interaction.user.id,
                            inline: true
                        },
                        {
                            name: "📊 Reports",
                            value: `${confession.reports.length}`,
                            inline: true
                        },
                        {
                            name: "💬 Confession Content",
                            value:
                                confession.content.length > 1024
                                    ? confession.content.slice(0, 1021) + "..."
                                    : confession.content
                        },
                        {
                            name: "🔗 Original Message",
                            value: `https://discord.com/channels/${interaction.guild.id}/${config.confessionChannel}/${confession.messageId}`
                        }
                    )
                    .setTimestamp();

                await modChannel.send({
                    content: config.lowMediumPing
                        .map(role => `<@&${role}>`)
                        .join(" "),
                    embeds: [embed]
                });

            }

        } catch (err) {

            console.error("Failed to send report:", err);

        }

        return interaction.reply({
            content: "✅ Thank you. The moderators have been notified.",
            ephemeral: true
        });

    }

};
