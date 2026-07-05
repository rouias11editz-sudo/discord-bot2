const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const config = require("../config");
const { moderateConfession } = require("../utils/ai");

const DATA_FILE = path.join(__dirname, "../data/confessions.json");

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        return {
            count: 0,
            confessions: []
        };
    }

    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

module.exports = async (interaction) => {

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== "confession_modal") return;

    await interaction.deferReply({
        ephemeral: true
    });

    const confession = interaction.fields.getTextInputValue("confession_text");

    let database = loadData();

    database.count++;

    const confessionNumber = database.count;

    const ai = await moderateConfession(confession);    
  
    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`💬 Anonymous Confession #${confessionNumber}`)
        .setDescription(confession)
        .setFooter({
            text: "Anonymous"
        })
        .setTimestamp();

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("confession_add")
                .setLabel("Add Confession")
                .setEmoji("➕")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`reply_${confessionNumber}`)
                .setLabel("Reply")
                .setEmoji("💬")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`report_${confessionNumber}`)
                .setLabel("Report")
                .setEmoji("🚩")
                .setStyle(ButtonStyle.Danger)
        );

    const confessionChannel =
        interaction.client.channels.cache.get(
            config.confessionChannel
        );

    const confessionMessage =
        await confessionChannel.send({
            embeds: [embed],
            components: [buttons]
        });
      database.confessions.push({
        id: confessionNumber,
        userId: interaction.user.id,
        confession: confession,
        messageId: confessionMessage.id,
        channelId: confessionChannel.id,
        createdAt: Date.now(),
        ai: ai
    });

    saveData(database);

    if (ai.flagged) {

        const pingRoles =
            ai.severity === "HIGH" || ai.severity === "CRITICAL"
                ? config.highPing
                : config.lowMediumPing;

        const pingString = pingRoles
            .map(id => `<@&${id}>`)
            .join(" ");

        const colors = {
            LOW: config.embedColors.LOW,
            MEDIUM: config.embedColors.MEDIUM,
            HIGH: config.embedColors.HIGH,
            CRITICAL: config.embedColors.CRITICAL
        };

        const alertEmbed = new EmbedBuilder()
            .setColor(colors[ai.severity] || config.embedColors.MEDIUM)
            .setTitle("🚨 AI Moderation Alert")
            .setDescription(
                `**Reason:**\n${ai.reason}\n\n` +
                `**Confidence:**\n${ai.confidence}%\n\n` +
                `**User:**\n${interaction.user} (${interaction.user.id})\n\n` +
                `**Confession:**\n${confession}\n\n` +
                `**Original Confession:**\n${confessionMessage.url}`
            )
            .setTimestamp();

        const modButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`safe_${confessionNumber}`)
                    .setLabel("Mark Safe")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`delete_${confessionNumber}`)
                    .setLabel("Delete")
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId(`timeout_${interaction.user.id}`)
                    .setLabel("Timeout")
                    .setEmoji("⏲️")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`ban_${interaction.user.id}`)
                    .setLabel("Ban")
                    .setEmoji("🔨")
                    .setStyle(ButtonStyle.Danger)
            );

        const modChannel =
            interaction.client.channels.cache.get(
                config.modAlertChannel
            );

        if (modChannel) {
            await modChannel.send({
                content: pingString,
                embeds: [alertEmbed],
                components: [modButtons]
            });
        }
    }

    await interaction.editReply({
        content: "✅ Your confession has been sent anonymously."
    });

};
