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
  name: "subtractbalance",
  description: "Subtract balance from a user.",
  options: [
    {
      name: 'user',
      type: 6, // USER type
      description: 'The user whose balance you want to subtract from.',
      required: true,
    },
    {
      name: 'amount',
      type: 4, // INTEGER type
      description: 'The amount to subtract from the user\'s balance.',
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

      if (amount <= 0) {
        interaction.editReply("Please enter a valid amount of starcrest to subtract.");
        return;
      }

      const guildId = interaction.guild.id;

      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Check if the user has enough balance
        db.get(
          "SELECT balance FROM users WHERE userId = ? AND guildId = ?",
          [targetUserId, guildId],
          (err, row) => {
            if (err) {
              console.error("Error querying database:", err);
              interaction.editReply({
                content: "An error occurred while fetching the user's balance.",
                ephemeral: true,
              });
              db.run("ROLLBACK TRANSACTION");
              return;
            }

            if (!row || row.balance < amount) {
              interaction.editReply("The user does not have enough starcrest to subtract.");
              db.run("ROLLBACK TRANSACTION");
              return;
            }

            // Subtract the balance
            db.run(
              "UPDATE users SET balance = balance - ? WHERE userId = ? AND guildId = ?",
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
                  `Successfully subtracted ${amount} starcrest from <@${targetUserId}>.`
                );
              }
            );
          }
        );
      });
    } catch (error) {
      console.log(`Error with /subtractbalance: ${error}`);
    }
  },
};
