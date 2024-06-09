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
  name: "setbalance",
  description: "Set the balance of a user.",
  options: [
    {
      name: 'user',
      type: 6, // USER type
      description: 'The user whose balance you want to set.',
      required: true,
    },
    {
      name: 'amount',
      type: 4, // INTEGER type
      description: 'The new balance for the user.',
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

    const member = await interaction.guild.members.fetch(interaction.user.id);

    // Periksa apakah pengguna memiliki izin administrator
    if (!member.permissions.has("ADMINISTRATOR")) {
      interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const targetUserId = interaction.options.getUser('user').id;
      const amount = interaction.options.getInteger('amount');

      if (amount < 0) {
        interaction.editReply("Please enter a valid amount of starcrest to set.");
        return;
      }

      const guildId = interaction.guild.id;

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run(
          "INSERT OR IGNORE INTO users (userId, guildId, balance) VALUES (?, ?, ?)",
          [targetUserId, guildId, 0], // Insert user with initial balance if they don't exist
          (err) => {
            if (err) {
              console.error("Error inserting user's initial balance:", err);
              interaction.editReply({
                content: "An error occurred while updating the balance.",
                ephemeral: true,
              });
              db.run("ROLLBACK TRANSACTION");
              return;
            }

            db.run(
              "UPDATE users SET balance = ? WHERE userId = ? AND guildId = ?",
              [amount, targetUserId, guildId],
              (err) => {
                if (err) {
                  console.error("Error updating user's balance:", err);
                  interaction.editReply({
                    content: "An error occurred while updating the balance.",
                    ephemeral: true,
                  });
                  db.run("ROLLBACK TRANSACTION");
                  return;
                }

                db.run("COMMIT TRANSACTION");

                interaction.editReply(
                  `Successfully set the balance of <@${targetUserId}> to ${amount} starcrest.`
                );
              }
            );
          }
        );
      });
    } catch (error) {
      console.log(`Error with /setbalance: ${error}`);
    }
  },
};
