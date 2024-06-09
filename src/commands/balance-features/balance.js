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

db.run(`
    ALTER TABLE users ADD COLUMN timestamp INTEGER;
`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error("Error adding timestamp column to users table:", err);
    }
});

module.exports = {
  name: "balance",
  description: "Check your starcrest.",
  options: [
    {
      name: 'user',
      type: 6, // 6 adalah tipe untuk user
      description: 'The user whose starcrest you want to check.',
      required: false,
    }
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

      const targetUserId = interaction.options.getUser('user') ? interaction.options.getUser('user').id : interaction.user.id;
      const guildId = interaction.guild.id;

      // Cek apakah pengguna sudah ada dalam database
      db.get(
        "SELECT balance, timestamp FROM users WHERE userId = ? AND guildId = ?",
        [targetUserId, guildId],
        async (err, row) => {
          if (err) {
            console.error("Error querying database:", err);
            return;
          }

          if (row) {
            const lastTransaction = row.timestamp ? new Date(row.timestamp * 1000).toLocaleString() : "No transactions recorded";
            interaction.editReply(
              `The balance of <@${targetUserId}> is **${row.balance}** starcrest.\nLast transaction: ${lastTransaction}`
            );
          } else {
            // Jika pengguna belum ada dalam database, saldo akan dianggap 0
            interaction.editReply(
              `The balance of <@${targetUserId}> is 0 starcrest.\nLast transaction: No transactions recorded`
            );
          }
        }
      );
    } catch (error) {
      console.log(`Error with /balance: ${error}`);
    }
  },
};