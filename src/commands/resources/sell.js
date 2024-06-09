const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

module.exports = {
  name: "sell",
  description: "Sell an item from your inventory.",
  options: [
    {
      name: "item",
      description: "The item you want to sell.",
      type: 3,
      required: true,
      autocomplete: true, // Enable autocomplete untuk opsi item
    },
    {
      name: "price",
      description: "The selling price of the item.",
      type: 4,
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
      const sellingPrice = interaction.options.getInteger("price");

      // Periksa apakah item ada di inventaris pengguna
      const row = await new Promise((resolve, reject) => {
        db.get(
          "SELECT quantity FROM inventory WHERE userId = ? AND guildId = ? AND itemName = ?",
          [userId, guildId, itemName],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!row || row.quantity === 0) {
        interaction.editReply({
          content: "You don't have that item in your inventory.",
          ephemeral: true,
        });
        return;
      }

      // Kurangi jumlah item di inventaris
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE inventory SET quantity = quantity - 1 WHERE userId = ? AND guildId = ? AND itemName = ?",
          [userId, guildId, itemName],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Hapus item dari inventaris jika jumlahnya menjadi 0
      await new Promise((resolve, reject) => {
        db.run(
          "DELETE FROM inventory WHERE userId = ? AND guildId = ? AND itemName = ? AND quantity <= 0",
          [userId, guildId, itemName],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Tambahkan item yang terjual ke pasar
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO market (userId, guildId, itemName, quantity, balance) VALUES (?, ?, ?, 1, ?)",
          [userId, guildId, itemName, sellingPrice],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Menampilkan pesan konfirmasi penjualan
      const confirmationEmbed = new EmbedBuilder()
        .setDescription(`## SELLING ITEM SUCCESSFULLY\n\`\`\`You have successfully sold ${itemName} with price ${sellingPrice} Starcrest\`\`\``)
        .setColor("#4CAF50"); // Warna hijau untuk pesan sukses 

      interaction.editReply({
        embeds: [confirmationEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.log(`Error with /sell: ${error}`);
      interaction.editReply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
