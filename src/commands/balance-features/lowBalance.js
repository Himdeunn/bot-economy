const { Client, Interaction } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

// Create the balances table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        balance INTEGER DEFAULT 0
    )
`);

// Tambahkan kolom timestamp ke tabel users jika belum ada
db.run(`
    ALTER TABLE users ADD COLUMN timestamp INTEGER;
`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error("Error adding timestamp column to users table:", err);
    }
});

module.exports = {
  name: "lowbalance",
  description: "Check if your balance is critically low.",
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

      // Ambil saldo pengguna dari database
      db.get(
        "SELECT balance, timestamp FROM users WHERE userId = ? AND guildId = ?",
        [userId, guildId],
        (err, row) => {
          if (err) {
            console.error("Error querying database:", err);
            interaction.editReply({
              content: "An error occurred while fetching your balance.",
              ephemeral: true,
            });
            return;
          }

          if (!row || row.balance < 500) { // Ubah batas sesuai kebutuhan Anda
            const lastTransaction = row && row.timestamp ? new Date(row.timestamp * 1000).toLocaleString() : "No transactions recorded";
            interaction.editReply(
              `Your balance is critically low! Please consider earning some starcrest.\nLast transaction: ${lastTransaction}`
            );
          } else {
            const lastTransaction = new Date(row.timestamp * 1000).toLocaleString();
            interaction.editReply(
              `Your balance is healthy. Keep it up!\nLast transaction: ${lastTransaction}`
            );
          }
        }
      );
    } catch (error) {
      console.log(`Error with /lowbalance: ${error}`);
    }
  },
};