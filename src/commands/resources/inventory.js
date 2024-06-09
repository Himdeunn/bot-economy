const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Batasan jumlah item dalam inventory
const MAX_INVENTORY_SLOTS = 10; // Ubah sesuai kebutuhan

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

// Buat tabel users jika belum ada
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        balance INTEGER DEFAULT 0,
        timestamp INTEGER
    )
`);

// Buat tabel inventory jika belum ada
db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        itemName TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1
    )
`);

db.run(`
  ALTER TABLE inventory ADD COLUMN lastLootTime INTEGER DEFAULT 0;
`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
      console.error("Error adding lastLootTime column to users table:", err);
  }
});

module.exports = {
  name: "inventory",
  description: "View your inventory.",
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

      // Periksa jumlah slot inventory yang tersedia
      db.get(
        "SELECT COUNT(*) AS numSlots FROM inventory WHERE userId = ? AND guildId = ?",
        [userId, guildId],
        (err, row) => {
          if (err) {
            console.error("Error querying inventory database:", err);
            interaction.editReply({
              content: "An error occurred while fetching your inventory.",
              ephemeral: true,
            });
            return;
          }

          const numOccupiedSlots = row.numSlots || 0;
          const numAvailableSlots = MAX_INVENTORY_SLOTS - numOccupiedSlots;

          if (numAvailableSlots <= 0) {
            interaction.editReply({
              content: "Your inventory is full. You cannot add more items.",
              ephemeral: true,
            });
            return;
          }

          // Lanjutkan logika untuk menampilkan inventory
          db.all(
            "SELECT itemName, SUM(quantity) as quantity FROM inventory WHERE userId = ? AND guildId = ? GROUP BY itemName",
            [userId, guildId],
            (err, rows) => {
              if (err) {
                console.error("Error querying inventory database:", err);
                interaction.editReply({
                  content: "An error occurred while fetching your inventory.",
                  ephemeral: true,
                });
                return;
              }

              if (rows.length === 0) {
                interaction.editReply({
                  content: "Your inventory is empty.",
                  ephemeral: true,
                });
                return;
              }

              const embed = new EmbedBuilder()
                .setAuthor({
                  name: interaction.user.username,
                  iconURL: interaction.user.avatarURL(), // URL avatar pengguna (opsional)
                })
                .setDescription(
                  `### Your Inventory\nHere are the items in your inventory:`
                )
                .setColor(0xffffff);

              rows.forEach((row) => {
                embed.addFields({
                  name: `⑆ ${row.itemName}`,
                  value: `\`\`\`Quantity: ${row.quantity}\`\`\``,
                  inline: true,
                });
              });

              interaction.editReply({
                embeds: [embed],
                ephemeral: true,
              });
            }
          );
        }
      );
    } catch (error) {
      console.log(`Error with /inventory: ${error}`);
    }
  },
};
