const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('target-user').value;
    const reason =
      interaction.options.get('reason')?.value || 'Tidak ada alasan yang diberikan';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("Pengguna tersebut tidak ada di server ini.");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply(
        "Kamu tidak bisa melakukan ban terhadap pengguna tersebut karena dia adalah pemilik server."
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Role tertinggi dari pengguna target
    const requestUserRolePosition = interaction.member.roles.highest.position; // Role tertinggi dari pengguna yang menjalankan perintah
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Role tertinggi dari bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Kamu tidak bisa melakukan ban terhadap pengguna tersebut karena dia memiliki role yang sama atau lebih tinggi darimu."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Saya tidak bisa melakukan ban terhadap pengguna tersebut karena dia memiliki role yang sama atau lebih tinggi dariku."
      );
      return;
    }

    // Melakukan ban terhadap targetUser
    try {
      await targetUser.ban({ reason });
      await interaction.editReply(
        `Pengguna ${targetUser} berhasil dibanned.\nAlasan: ${reason}`
      );
    } catch (error) {
      console.log(`Terjadi kesalahan saat melakukan ban: ${error}`);
    }
  },

  name: 'ban',
  description: 'Melakukan ban terhadap seorang pengguna di server.',
  options: [
    {
      name: 'target-user',
      description: 'Pengguna yang ingin dibanned.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'Alasan melakukan ban.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
