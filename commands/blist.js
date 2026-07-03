const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

const allowedRoles = [
  '1510271113651818717',
  '1510273045691109417',
  '1510273298850910348',
  '1510273221172396032'
];

const blistChannelId = '1522479837703307364';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blist')
    .setDescription('Blacklist system')

    // POST subcommand
    .addSubcommand(sub =>
      sub.setName('post')
        .setDescription('Post a blist')
        .addStringOption(opt =>
          opt.setName('link')
            .setDescription('Google Docs link')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('vanity')
            .setDescription('discord.gg link')
            .setRequired(true))
        .addBooleanOption(opt =>
          opt.setName('ping')
            .setDescription('Ping everyone?')
            .setRequired(false))
    )

    // BAN subcommand
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Ban multiple user IDs')
        .addStringOption(opt =>
          opt.setName('ids')
            .setDescription('User IDs separated by space')
            .setRequired(true))
    ),

  async execute(interaction, client) {
    // ROLE CHECK
    const hasRole = interaction.member.roles.cache.some(role =>
      allowedRoles.includes(role.id)
    );

    if (!hasRole) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();

    // -------------------
    // /blist post
    // -------------------
    if (sub === 'post') {
      const link = interaction.options.getString('link');
      const vanity = interaction.options.getString('vanity');
      const ping = interaction.options.getBoolean('ping') || false;

      const embed = new EmbedBuilder()
        .setColor('#001F3F')
        .setDescription(
          `📓 New blist on /${vanity}\n\n` +
          `📄 Doc: ${link}\n\n` +
          `🚫 DO NOT JOIN\nServ link: ${vanity}\n\n` +
          `Blist sent by ${interaction.user}`
        )
        .setTimestamp();

      const channel = await client.channels.fetch(blistChannelId);

      if (ping) {
        await channel.send('@everyone');
      }

      await channel.send({ embeds: [embed] });

      return interaction.reply({
        content: '✅ Blist posted successfully.',
        ephemeral: true
      });
    }

    // -------------------
    // /blist ban
    // -------------------
    if (sub === 'ban') {
      const ids = interaction.options.getString('ids').split(' ');

      let results = [];

      for (const id of ids) {
        try {
          const member = await interaction.guild.members.fetch(id);
          await member.ban({ reason: 'Banned via blist command' });
          results.push(`✅ Banned: ${id}`);
        } catch (err) {
          results.push(`❌ Failed: ${id}`);
        }
      }

      return interaction.reply({
        content: results.join('\n'),
        ephemeral: true
      });
    }
  }
};
