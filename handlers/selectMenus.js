const sessions = require("../utils/wizardSessions");

module.exports = async (interaction) => {

    let session = sessions.get(interaction.guild.id);

    if (!session) {
        session = sessions.create(interaction.guild.id);
    }

    // ==========================
    // Confession Channel
    // ==========================

    if (interaction.customId === "wizard_confession_channel") {

        session.confessionChannel = interaction.values[0];

        return interaction.reply({
            content: "✅ Confession channel selected.",
            ephemeral: true
        });

    }

    // ==========================
    // Moderator Alert Channel
    // ==========================

    if (interaction.customId === "wizard_modalert_channel") {

        session.modAlertChannel = interaction.values[0];

        return interaction.reply({
            content: "✅ Moderator alert channel selected.",
            ephemeral: true
        });

    }

    // ==========================
    // Moderator Roles
    // ==========================

    if (interaction.customId === "wizard_mod_roles") {

        session.modRoles = interaction.values;

        return interaction.reply({
            content: `✅ ${interaction.values.length} moderator role(s) selected.`,
            ephemeral: true
        });

    }

};
