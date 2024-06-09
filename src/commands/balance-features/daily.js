const { Client, Interaction } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

// Create the warnings table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        balance INTEGER DEFAULT 0,
        lastDaily TEXT
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

const dailyAmount = 1000;

module.exports = {
  name: "daily",
  description: "Collect your starcrest!",
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
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

      const userId = interaction.member.id;
      const guildId = interaction.guild.id;
      const now = Math.floor(Date.now() / 1000); // Timestamp saat ini dalam detik

      // Cek apakah pengguna sudah ada dalam database
      db.get(
        "SELECT * FROM users WHERE userId = ? AND guildId = ?",
        [userId, guildId],
        async (err, row) => {
          if (err) {
            console.error("Error querying database:", err);
            return;
          }

          if (row) {
            const lastDailyDate = new Date(row.lastDaily).toDateString();
            const currentDate = new Date().toDateString();

            if (lastDailyDate === currentDate) {
              interaction.editReply(
                "You have already collected your starcrest today. Come back tomorrow!"
              );
              return;
            }

            // Update waktu terakhir pengguna mengklaim daily
            db.run(
              "UPDATE users SET lastDaily = ?, timestamp = ? WHERE userId = ? AND guildId = ?",
              [new Date().toISOString(), now, userId, guildId]
            );
          } else {
            // Jika pengguna belum ada dalam database, tambahkan pengguna baru
            db.run(
              "INSERT INTO users (userId, guildId, lastDaily, timestamp) VALUES (?, ?, ?, ?)",
              [userId, guildId, new Date().toISOString(), now]
            );
          }

          // Tambahkan saldo harian ke saldo pengguna
          db.run(
            "UPDATE users SET balance = balance + ? WHERE userId = ? AND guildId = ?",
            [dailyAmount, userId, guildId],
            async () => {
              // Ambil saldo terbaru pengguna dari database
              db.get(
                "SELECT balance FROM users WHERE userId = ? AND guildId = ?",
                [userId, guildId],
                (err, row) => {
                  if (err) {
                    console.error("Error querying database:", err);
                    return;
                  }
                  // Kirim balasan dengan saldo baru pengguna
                  interaction.editReply(
                    `${dailyAmount} starcrest was added to your balance. Your new balance is ${row.balance} starcrest.`
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
    }
  },
};