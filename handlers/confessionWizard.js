const {
    EmbedBuilder
} = require("discord.js");

module.exports = async (interaction) => {

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🛠 Confession Setup Wizard")
        .setDescription(
            "This wizard is under construction.\n\nNext we'll add channel and role selectors."
        );

    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });

};
