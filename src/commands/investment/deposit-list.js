const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

module.exports = {
  name: "deposit-list",
  description: "View your bank balance.",
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      // Dapatkan saldo bank pengguna
      db.get(
        "SELECT balance FROM bank WHERE userId = ? AND guildId = ?",
        [userId, guildId],
        (err, row) => {
          if (err) {
            console.error("Error querying bank database:", err);
            interaction.editReply({
              content: "An error occurred while fetching your bank balance.",
              ephemeral: true,
            });
            return;
          }

          if (!row) {
            interaction.editReply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(`## Ohh Crapp!!\n\`\`\`You don't have a bank account yet.\nPlease save at the bank to create an account\`\`\``)
                    .setColor(0xFF5733) // Red color
                ],
                ephemeral: true,
              });              
            return;
          }

          // Tampilkan saldo bank pengguna
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`## YOUR BANK ACCOUNT\n\`\`\`Your current bank balance is ${row.balance} Starcrest.\`\`\``)
                .setColor(0x7289da) // Discord purple color
            ],
            ephemeral: true,
          });
        }
      );
    } catch (error) {
      console.log(`Error with /deposit-list: ${error}`);
      interaction.editReply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
