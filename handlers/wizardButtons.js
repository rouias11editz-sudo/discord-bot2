const settings = require("../utils/settings");
const sessions = require("../utils/wizardSessions");

module.exports = async (interaction) => {

    console.log("BUTTON:", interaction.customId);

    const session = sessions.get(interaction.guild.id);
    
    if (!session) {
        return interaction.reply({
            content: "❌ No setup session found.",
            ephemeral: true
        });

    }

    // ==========================
    // Save
    // ==========================

    if (interaction.customId === "wizard_save") {

        settings.setGuild(interaction.guild.id, {
            confessionChannel: session.confessionChannel,
            modAlertChannel: session.modAlertChannel,
            modRoles: session.modRoles
        });

        sessions.remove(interaction.guild.id);

        return interaction.update({
            content: "✅ Configuration saved successfully!",
            embeds: [],
            components: []
        });

    }

    // ==========================
    // Cancel
    // ==========================

    if (interaction.customId === "wizard_cancel") {

        sessions.remove(interaction.guild.id);

        return interaction.update({
            content: "❌ Setup cancelled.",
            embeds: [],
            components: []
        });

    }

};
