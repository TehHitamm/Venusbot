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
        "Kamu tidak bisa mengeluarkan pengguna tersebut karena dia adalah pemilik server."
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Peran tertinggi dari pengguna target
    const requestUserRolePosition = interaction.member.roles.highest.position; // Peran tertinggi dari pengguna yang menjalankan perintah
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Peran tertinggi dari bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "Kamu tidak bisa mengeluarkan pengguna tersebut karena dia memiliki peran yang sama atau lebih tinggi dari kamu."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "Saya tidak bisa mengeluarkan pengguna tersebut karena dia memiliki peran yang sama atau lebih tinggi dari saya."
      );
      return;
    }

    // Mengeluarkan pengguna target
    try {
      await targetUser.kick({ reason });
      await interaction.editReply(
        `Pengguna ${targetUser} telah dikeluarkan\nAlasan: ${reason}`
      );
    } catch (error) {
      console.log(`Terjadi kesalahan saat mengeluarkan: ${error}`);
    }
  },

  name: 'kick',
  description: 'Mengeluarkan anggota dari server ini.',
  options: [
    {
      name: 'target-user',
      description: 'Pengguna yang ingin kamu keluarkan.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'Alasan mengeluarkan.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
