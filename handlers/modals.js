const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config = require("../config");
const db = require("../utils/database");
const { moderateConfession } = require("../utils/ai");

module.exports = async (interaction) => {

    if (interaction.customId !== "confession_modal") return;

    const text = interaction.fields
        .getTextInputValue("confession_text")
        .trim();

    if (!text.length) {
        return interaction.reply({
            content: "❌ Your confession cannot be empty.",
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    // Save the confession first
    const confession = db.createConfession(
        interaction.user.id,
        text
    );

    // AI analysis (used only to include info in the mod alert later)
    let aiResult = {
        flagged: false,
        severity: "LOW",
        confidence: 0,
        reason: "None"
    };

    try {
        aiResult = await moderateConfession(text);
    } catch (e) {
        console.error("AI error:", e);
    }

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`💬 Anonymous Confession #${confession.id}`)
        .setDescription(text)
        .setFooter({
            text: "Anonymous"
        })
        .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`confession_add`)
            .setLabel("Add Confession")
            .setEmoji("➕")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId(`confession_reply_${confession.id}`)
            .setLabel("Reply")
            .setEmoji("💬")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId(`confession_report_${confession.id}`)
            .setLabel("Report")
            .setEmoji("🚩")
            .setStyle(ButtonStyle.Danger)
    );

    const channel = await interaction.client.channels.fetch(
        config.confessionChannel
    );

    if (!channel) {
        return interaction.editReply({
            content: "❌ Confession channel not found."
        });
    }

    const message = await channel.send({
        embeds: [embed],
        components: [buttons]
    });

    db.updateMessage(confession.id, message.id);

await interaction.editReply({
    content: `✅ Your anonymous confession has been posted as **#${confession.id}**.`
});

// =========================
// Moderator Notification
// =========================

if (aiResult.flagged) {

    try {

        const modChannel = await interaction.client.channels.fetch(
            config.modAlertChannel
        );

        if (modChannel) {

            const embed = new EmbedBuilder()
                .setColor(
                    aiResult.severity === "HIGH"
                        ? 0xff0000
                        : aiResult.severity === "MEDIUM"
                        ? 0xffa500
                        : 0xffff00
                )
                .setTitle("🚨 AI Flagged Confession")
                .addFields(
                    {
                        name: "Reason",
                        value: aiResult.reason || "Unknown"
                    },
                    {
                        name: "Severity",
                        value: aiResult.severity || "LOW",
                        inline: true
                    },
                    {
                        name: "Confidence",
                        value: `${aiResult.confidence || 0}%`,
                        inline: true
                    },
                    {
                        name: "User",
                        value: `<@${interaction.user.id}>`
                    },
                    {
                        name: "User ID",
                        value: interaction.user.id
                    },
                    {
                        name: "Confession",
                        value: text.length > 1024
                            ? text.slice(0, 1021) + "..."
                            : text
                    },
                    {
                        name: "Original Confession",
                        value: `https://discord.com/channels/${interaction.guild.id}/${channel.id}/${message.id}`
                    }
                )
                .setTimestamp();

            await modChannel.send({
                embeds: [embed]
            });

        }

    } catch (err) {

        console.error("Failed to send moderator alert:", err);

    }

}
