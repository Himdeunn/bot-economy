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
db.run(
  `
    ALTER TABLE users ADD COLUMN timestamp INTEGER;
`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding timestamp column to users table:", err);
    }
  }
);

module.exports = {
  name: "transfer",
  description: "Transfer starcrest to another user.",
  options: [
    {
      name: 'recipient',
      type: 6,
      description: 'The user you want to transfer starcrest to.',
      required: true,
    },
    {
      name: 'amount',
      type: 4,
      description: 'The amount of starcrest you want to transfer.',
      required: true,
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

      const senderId = interaction.user.id;
      const recipientId = interaction.options.getUser('recipient').id;
      const amount = interaction.options.getInteger('amount');

      if (senderId === recipientId) {
        interaction.editReply("You cannot transfer starcrest to yourself!");
        return;
      }

      if (amount <= 0) {
        interaction.editReply("Please enter a valid amount of starcrest to transfer.");
        return;
      }

      const guildId = interaction.guild.id;

      // Cek apakah pengirim memiliki saldo cukup
      db.get(
        "SELECT balance FROM users WHERE userId = ? AND guildId = ?",
        [senderId, guildId],
        (err, row) => {
          if (err) {
            console.error("Error querying database:", err);
            interaction.editReply({
              content: "An error occurred while fetching your balance.",
              ephemeral: true,
            });
            return;
          }

          if (!row || row.balance < amount) {
            interaction.editReply(
              "You do not have enough starcrest to transfer."
            );
            return;
          }

          // Mulai transaksi SQL
          db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Kurangi saldo pengirim
            db.run(
              "UPDATE users SET balance = balance - ? WHERE userId = ? AND guildId = ?",
              [amount, senderId, guildId],
              (err) => {
                if (err) {
                  console.error("Error updating sender's balance:", err);
                  interaction.editReply({
                    content: "An error occurred while updating your balance.",
                    ephemeral: true,
                  });
                  db.run("ROLLBACK TRANSACTION");
                  return;
                }

                // Tambah saldo penerima
                db.run(
                  "INSERT OR IGNORE INTO users (userId, guildId, balance) VALUES (?, ?, ?)",
                  [recipientId, guildId, 0], // Masukkan pengguna baru jika belum ada
                  (err) => {
                    if (err) {
                      console.error("Error inserting recipient's initial balance:", err);
                      interaction.editReply({
                        content: "An error occurred while updating the recipient's balance.",
                        ephemeral: true,
                      });
                      db.run("ROLLBACK TRANSACTION");
                      return;
                    }

                    // Update saldo penerima
                    db.run(
                      "UPDATE users SET balance = balance + ? WHERE userId = ? AND guildId = ?",
                      [amount, recipientId, guildId],
                      (err) => {
                        if (err) {
                          console.error("Error updating recipient's balance:", err);
                          interaction.editReply({
                            content: "An error occurred while updating the recipient's balance.",
                            ephemeral: true,
                          });
                          db.run("ROLLBACK TRANSACTION");
                          return;
                        }

                        // Selesai transaksi SQL
                        db.run("COMMIT TRANSACTION");

                        interaction.editReply(
                          `Successfully transferred ${amount} starcrest to <@${recipientId}>.`
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        }
      );
    } catch (error) {
      console.log(`Error with /transfer: ${error}`);
    }
  },
};
