module.exports = {
    name: 'ping',
    description: 'Replies with the bot ping!',
  
    callback: async (client, interaction) => {
        await interaction.deferReply();
  
        // Mendapatkan server dari interaction
        const guild = interaction.guild;
  
        // Mendapatkan role admin dari server (ganti 'admin_role_id' dengan ID role admin yang sesuai)
        const adminRole = guild.roles.cache.get('1228336114616504343'); // Ganti dengan ID role admin Anda
  
        // Memeriksa apakah pengguna memiliki peran admin
        if (!interaction.member.roles.cache.has(adminRole.id)) {
            await interaction.editReply({ content: 'Anda tidak memiliki izin untuk menggunakan perintah ini.', ephemeral: true });
            return;
        }
  
        const reply = await interaction.fetchReply();
  
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
  
        interaction.editReply({
          content: `🏓 **Pong!**\n\n
          ───────────────\n
          📟 **Client Ping:** \`${ping}ms\`\n
          🌐 **WebSocket Ping:** \`${client.ws.ping}ms\`\n
          ───────────────\n
          Enjoy your time in the server! 🎮`
      });    
    },
  };