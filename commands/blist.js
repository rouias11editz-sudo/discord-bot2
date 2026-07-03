const {
  SlashCommandBuilder
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

    // POST
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
            .setRequired(false)
        )
    )

    // BAN
    .addSubcommand(sub =>
      sub.setName('ban')
        .setDescription('Ban multiple user IDs')
        .addStringOption(opt =>
          opt.setName('ids')
            .setDescription('User IDs separated by space')
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {

    // ROLE CHECK
    const hasRole = interaction.member.roles.cache.some(role =>
      allowedRoles.includes(role.id)
    );

    if (!hasRole) {
      return interaction.reply({
        content: ' u do not have permission to use this command.',
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

      const channel = await client.channels.fetch(blistChannelId);

      let message = '';

      if (ping) {
        message += '@everyone\n\n';
      }

      message +=
`woohooo new blist ig on /${vanity}

blist doc: ${link}

dont join the link pls
Serv link: ${vanity}

sent by ${interaction.user}`;

      await channel.send({ content: message });

      return interaction.reply({
        content: 'blist posted successfully thanks ig.',
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
        } catch {
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
