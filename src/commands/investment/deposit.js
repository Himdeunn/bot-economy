const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

// Buat tabel bank jika belum ada
db.run(`
    CREATE TABLE IF NOT EXISTS bank (
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        UNIQUE (userId, guildId)
    )
`);


module.exports = {
  name: "deposit",
  description: "Deposit money into your bank account.",
  options: [
    {
      name: "amount",
      description: "The amount of money you want to deposit.",
      type: 4, // Changed from 3 to 4 to indicate INTEGER type
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
      const amount = interaction.options.getInteger("amount");

      if (amount <= 0) {
        interaction.editReply({
          content: "You can only deposit a positive amount of money.",
          ephemeral: true,
        });
        return;
      }

      db.run(
        "INSERT INTO bank (userId, guildId, balance) VALUES (?, ?, ?) ON CONFLICT(userId, guildId) DO UPDATE SET balance = balance + ?",
        [userId, guildId, amount, amount],
        (err) => {
          if (err) throw err;
          else {
            // Perbarui balance pengguna di tabel users
            db.run(
              "UPDATE users SET balance = balance - ? WHERE userId = ? AND guildId = ?",
              [amount, userId, guildId],
              (err) => {
                if (err) throw err;
                else {
                  interaction.editReply({
                    embeds: [
                      new EmbedBuilder()
                        .setDescription(`## <a:bluecheck:1249357845326069790>DEPOSIT SUCCESSFULLY<a:bluecheck:1249357845326069790>\n\`\`\`You have successfully deposited ${amount} starcrest into your bank account.\`\`\`\n### NOTE :\n\`\`\`Remember that every starcrest you save today is an opportunity to build a safer and more prosperous life.\`\`\``)
                        .setColor(0x00ff00) // Green color
                    ],
                    ephemeral: true,
                  });              
                }
              }
            );              
          }
        }
      );      
    } catch (error) {
      console.log(`Error with /deposit: ${error}`);
      interaction.editReply({
        content: "An error occurred while processing your deposit.",
        ephemeral: true,
      });
    }
  },
};
