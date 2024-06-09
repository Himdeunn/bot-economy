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

db.run(
  `
    ALTER TABLE users ADD COLUMN lastWorkTimestamp INTEGER DEFAULT 0;
`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error(
        "Error adding lastWorkTimestamp column to users table:",
        err
      );
    }
  }
);

db.run(
  `
    ALTER TABLE users ADD COLUMN tiredness REAL DEFAULT 0;
`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding tiredness column to users table:", err);
    }
  }
);

module.exports = {
  name: "work",
  description: "Work and earn starcrest based on your job.",
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

      // Cek pekerjaan, waktu terakhir bekerja, dan tingkat kelelahan pengguna dari database
      db.get(
        "SELECT job, lastWorkTimestamp, tiredness FROM users WHERE userId = ? AND guildId = ?",
        [userId, guildId],
        (err, row) => {
          if (err) {
            console.error("Error querying database:", err);
            interaction.editReply({
              content: "An error occurred while fetching your job details.",
              ephemeral: true,
            });
            return;
          }

          if (!row || !row.job) {
            interaction.editReply(
              "You haven't chosen a job yet. Use the /jobchoose command to choose a job."
            );
            return;
          }

          const job = row.job;
          const lastWorkTimestamp = row.lastWorkTimestamp || 0;
          const tiredness = row.tiredness || 0;

          // Hitung waktu sejak terakhir kali bekerja
          const currentTime = Date.now();
          const timeSinceLastWork = currentTime - lastWorkTimestamp;

          // Hitung kelelahan saat ini berdasarkan waktu sejak terakhir kali bekerja
          const tirednessDecreaseRate = 0.0005; // Tingkat penurunan kelelahan per milidetik
          const tirednessDecrease = timeSinceLastWork * tirednessDecreaseRate;
          const updatedTiredness = Math.max(tiredness - tirednessDecrease, 0); // Kelelahan tidak dapat kurang dari 0

          // Cek apakah pengguna masih dalam batas waktu maksimal bekerja (1 menit atau 60 detik)
          const maxWorkTime = 60000; // Waktu maksimal bekerja dalam milidetik (1 menit)
          if (timeSinceLastWork < maxWorkTime) {
            interaction.editReply({
                content: "You have worked recently. Please wait before working again.",
                ephemeral: true,
                embeds: [
                  {
                    title: "♨ You are tired and exhausted ♨",
                    description: "You have already worked recently and need some rest before working again.",
                    color: 0xFF5733 // Warna merah
                  }
                ]
              });              
            return;
          }

          // Hitung upah berdasarkan pekerjaan
          let pay = 0;
          switch (job.toLowerCase()) {
            case "miner":
              pay = 200; // Contoh upah untuk pekerjaan miner
              break;
            case "farmer":
              pay = 200; // Contoh upah untuk pekerjaan farmer
              break;
            case "builder":
              pay = 432; // Contoh upah untuk pekerjaan builder
              break;
            case "explorer":
              pay = 357; // Contoh upah untuk pekerjaan explorer
              break;
            case "crafter":
              pay = 221; // Contoh upah untuk pekerjaan crafter
              break;
            case "redstone engineer":
              pay = 199; // Contoh upah untuk pekerjaan redstone engineer
              break;
            case "enchanter":
              pay = 243; // Contoh upah untuk pekerjaan enchanter
              break;
            case "monster hunter":
              pay = 100; // Contoh upah untuk pekerjaan monster hunter
              break;
            // Tambahkan case untuk pekerjaan lain di sini
            default:
              interaction.editReply("Invalid job.");
              return;
          }

          // Kurangi kelelahan dari pengguna dan atur waktu terakhir bekerja
          db.run(
            "UPDATE users SET balance = balance + ?, tiredness = ?, lastWorkTimestamp = ? WHERE userId = ? AND guildId = ?",
            [pay, updatedTiredness, currentTime, userId, guildId],
            (err) => {
              if (err) {
                console.error(
                  "Error updating user's balance and tiredness:",
                  err
                );
                interaction.editReply({
                  content:
                    "An error occurred while updating your balance and tiredness.",
                  ephemeral: true,
                });
                return;
              }

              interaction.editReply(
                `You worked as a **${job}** and earned **${pay}** starcrest.`
              );
            }
          );
        }
      );
    } catch (error) {
      console.log(`Error with /work: ${error}`);
    }
  },
};
