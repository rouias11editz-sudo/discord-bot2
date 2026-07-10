const { get, create } = require("../utils/wizardSessions");

module.exports = async (interaction) => {

    const id = interaction.guild.id;

    let session = get(id);

    if (!session)
        session = create(id);

    // ===========================
    // Confession Channel
    // ===========================

    if (interaction.customId === "wizard_confession_channel") {

        session.confessionChannel =
            interaction.values[0];

        return interaction.deferUpdate();

    }

    // ===========================
    // Mod Alert Channel
    // ===========================

    if (interaction.customId === "wizard_modalert_channel") {

        session.modAlertChannel =
            interaction.values[0];

        return interaction.deferUpdate();

    }

    // ===========================
    // Moderator Roles
    // ===========================

    if (interaction.customId === "wizard_mod_roles") {

        session.modRoles =
            interaction.values;

        return interaction.deferUpdate();

    }

};
