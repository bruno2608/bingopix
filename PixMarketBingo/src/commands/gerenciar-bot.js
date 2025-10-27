const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getSettings, saveSettings } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gerenciar-bot')
    .setDescription('Gerencia configurações do bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('canal-sorteio')
        .setDescription('Define o canal para sorteios automáticos')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal onde os sorteios serão exibidos')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('adicionar-cargo')
        .setDescription('Adiciona um cargo autorizado a gerenciar bingos')
        .addRoleOption(option =>
          option.setName('cargo')
            .setDescription('Cargo a ser autorizado')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover-cargo')
        .setDescription('Remove um cargo autorizado')
        .addRoleOption(option =>
          option.setName('cargo')
            .setDescription('Cargo a ser removido')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('ver-config')
        .setDescription('Mostra as configurações atuais')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const settings = getSettings(guildId);

    if (subcommand === 'canal-sorteio') {
      const channel = interaction.options.getChannel('canal');
      settings.drawChannel = channel.id;
      saveSettings(guildId, settings);

      const embed = new EmbedBuilder()
        .setColor('#43B581')
        .setTitle('✅ Canal de Sorteio Configurado')
        .setDescription(`Os sorteios serão exibidos em ${channel}`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'adicionar-cargo') {
      const role = interaction.options.getRole('cargo');
      
      if (!settings.adminRoles) {
        settings.adminRoles = [];
      }

      if (settings.adminRoles.includes(role.id)) {
        return interaction.reply({
          content: '❌ Este cargo já está autorizado!',
          ephemeral: true
        });
      }

      settings.adminRoles.push(role.id);
      saveSettings(guildId, settings);

      const embed = new EmbedBuilder()
        .setColor('#43B581')
        .setTitle('✅ Cargo Adicionado')
        .setDescription(`${role} agora pode gerenciar bingos`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'remover-cargo') {
      const role = interaction.options.getRole('cargo');

      if (!settings.adminRoles || !settings.adminRoles.includes(role.id)) {
        return interaction.reply({
          content: '❌ Este cargo não está autorizado!',
          ephemeral: true
        });
      }

      settings.adminRoles = settings.adminRoles.filter(id => id !== role.id);
      saveSettings(guildId, settings);

      const embed = new EmbedBuilder()
        .setColor('#43B581')
        .setTitle('✅ Cargo Removido')
        .setDescription(`${role} não pode mais gerenciar bingos`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'ver-config') {
      const embed = new EmbedBuilder()
        .setColor('#7289DA')
        .setTitle('⚙️ Configurações do Bot')
        .setTimestamp();

      if (settings.drawChannel) {
        embed.addFields({
          name: '📺 Canal de Sorteio',
          value: `<#${settings.drawChannel}>`,
          inline: false
        });
      } else {
        embed.addFields({
          name: '📺 Canal de Sorteio',
          value: 'Não configurado',
          inline: false
        });
      }

      if (settings.adminRoles && settings.adminRoles.length > 0) {
        const roles = settings.adminRoles.map(id => `<@&${id}>`).join(', ');
        embed.addFields({
          name: '👑 Cargos Autorizados',
          value: roles,
          inline: false
        });
      } else {
        embed.addFields({
          name: '👑 Cargos Autorizados',
          value: 'Apenas administradores',
          inline: false
        });
      }

      return interaction.reply({ embeds: [embed] });
    }
  }
};
