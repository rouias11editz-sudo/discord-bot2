const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

const settings = require("../utils/settings");
const db = require("../utils/database");
const { moderateConfession } = require("../utils/ai");

module.exports = async (interaction) => {

    // ==========================================
    // Anonymous Reply Modal
    // ==========================================

    if (interaction.customId.startsWith("reply_modal_")) {

        const confessionId = Number(
            interaction.customId.split("_")[2]
        );

        const confession = db.getConfession(confessionId);

        if (!confession) {

            return interaction.reply({
                content: "❌ Confession not found.",
                ephemeral: true
            });

        }

        const reply = interaction.fields
            .getTextInputValue("reply_text")
            .trim();

        await interaction.deferReply({
            ephemeral: true
        });

        const guild = settings.getGuild(interaction.guild.id);

if (!guild.confessionChannel) {
    return interaction.editReply({
        content: "❌ This server has not been configured yet. Run **/confession wizard**."
    });
}

const confessionChannel =
    await interaction.client.channels.fetch(
        guild.confessionChannel
    );

        const confessionMessage =
            await confessionChannel.messages.fetch(
                confession.messageId
            );

        let thread;

        if (confession.threadId) {

            thread =
                await interaction.client.channels.fetch(
                    confession.threadId
                );

        } else {

            thread = await confessionMessage.startThread({
                name: `Replies • #${confession.id}`,
                autoArchiveDuration: 1440
            });

            db.updateThread(
                confession.id,
                thread.id
            );

        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("💬 Anonymous Reply")
            .setDescription(reply)
            .setFooter({
                text: `Confession #${confession.id}`
            })
            .setTimestamp();

        await thread.send({
            embeds: [embed]
        });

        return interaction.editReply({
            content:
                "✅ Your anonymous reply has been posted."
        });

    }

    // ==========================================
    // New Confession Modal
    // ==========================================

    if (interaction.customId !== "confession_modal") return;

    // KEEP THE REST OF YOUR CURRENT CODE BELOW THIS LINE

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

    const guild = settings.getGuild(interaction.guild.id);

if (!guild.confessionChannel) {
    return interaction.editReply({
        content: "❌ This server has not been configured yet. Run **/confession wizard**."
    });
}

const channel = await interaction.client.channels.fetch(
    guild.confessionChannel
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

        if (!guild.modAlertChannel) return;

const modChannel = await interaction.client.channels.fetch(
    guild.modAlertChannel
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

};
