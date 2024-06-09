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
  name: "totalbalance",
  description: "Check the total balance of all users in the server.",
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

      const guildId = interaction.guild.id;

      // Hitung total saldo dari semua pengguna di dalam server
      db.all(
        "SELECT SUM(balance) AS totalBalance FROM users WHERE guildId = ?",
        [guildId],
        (err, rows) => {
          if (err) {
            console.error("Error querying database:", err);
            interaction.editReply({
              content: "An error occurred while fetching the total balance.",
              ephemeral: true,
            });
            return;
          }

          const totalBalance = rows[0].totalBalance || 0;
          interaction.editReply(
            `The total balance of all users in this server is **${totalBalance}** starcrest.`
          );
        }
      );
    } catch (error) {
      console.log(`Error with /totalbalance: ${error}`);
    }
  },
};