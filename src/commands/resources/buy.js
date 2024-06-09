const { Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

module.exports = {
  name: "buy",
  description: "Buy an item from the market.",
  options: [
    {
      name: "item",
      description: "The item you want to buy.",
      type: 3,
      required: true,
    },
  ],
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
      const itemName = interaction.options.getString("item");

      // Periksa apakah item ada di pasar
      db.get(
        "SELECT balance FROM market WHERE guildId = ? AND itemName = ?",
        [guildId, itemName],
        async (err, row) => {
          if (err) {
            console.error("Error querying market database:", err);
            interaction.editReply({
              content: "An error occurred while fetching market items.",
              ephemeral: true,
            });
            return;
          }

          if (!row) {
            interaction.editReply({
              content: "The item you want to buy is not available in the market.",
              ephemeral: true,
            });
            return;
          }

          const balance = row.balance;

          // Kurangi saldo pengguna dengan harga pembelian
          db.run(
            "UPDATE users SET balance = balance - ? WHERE userId = ? AND guildId = ?",
            [balance, userId, guildId],
            async (err) => {
              if (err) {
                console.error("Error updating user balance:", err);
                interaction.editReply({
                  content: "An error occurred while updating your balance.",
                  ephemeral: true,
                });
                return;
              }

              // Tambahkan item ke inventaris pengguna
              db.run(
                "INSERT INTO inventory (userId, guildId, itemName) VALUES (?, ?, ?)",
                [userId, guildId, itemName],
                async (err) => {
                  if (err) {
                    console.error("Error adding item to inventory:", err);
                    interaction.editReply({
                      content: "An error occurred while adding the item to your inventory.",
                      ephemeral: true,
                    });
                    return;
                  }

                  // Hapus item dari pasar
                  db.run(
                    "DELETE FROM market WHERE guildId = ? AND itemName = ?",
                    [guildId, itemName],
                    async (err) => {
                      if (err) {
                        console.error("Error removing item from market:", err);
                        interaction.editReply({
                          content: "An error occurred while removing the item from the market.",
                          ephemeral: true,
                        });
                        return;
                      }

                      // Tampilkan pesan konfirmasi pembelian
                      interaction.editReply({
                        content: `You successfully bought ${itemName} for ${balance} coins. The item has been added to your inventory.`,
                        ephemeral: true,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.log(`Error with /buy: ${error}`);
      interaction.editReply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
