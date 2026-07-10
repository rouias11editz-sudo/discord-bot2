const {
    EmbedBuilder,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

module.exports = async (interaction) => {

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🛠️ Confession Setup Wizard")
        .setDescription(
`Configure your confession system.

🟥 Confession Channel
🟥 Moderator Alert Channel
🟥 Moderator Roles

Press **Save** when finished.`
        );

    const confessionChannel = new ChannelSelectMenuBuilder()
        .setCustomId("wizard_confession_channel")
        .setPlaceholder("Select Confession Channel")
        .addChannelTypes(ChannelType.GuildText);

    const modAlert = new ChannelSelectMenuBuilder()
        .setCustomId("wizard_modalert_channel")
        .setPlaceholder("Select Moderator Alert Channel")
        .addChannelTypes(ChannelType.GuildText);

    const modRoles = new RoleSelectMenuBuilder()
        .setCustomId("wizard_mod_roles")
        .setPlaceholder("Select Moderator Roles")
        .setMinValues(1)
        .setMaxValues(10);

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("wizard_save")
            .setLabel("Save")
            .setEmoji("💾")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("wizard_cancel")
            .setLabel("Cancel")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(confessionChannel),
            new ActionRowBuilder().addComponents(modAlert),
            new ActionRowBuilder().addComponents(modRoles),
            buttons
        ],
        ephemeral: true
    });

};
