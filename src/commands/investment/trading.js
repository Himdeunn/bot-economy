const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

module.exports = {
  name: "trade",
  description: "Trade to potentially increase your balance.",
  options: [
    {
      name: "amount",
      description: "The amount you want to trade.",
      type: 3, // Mengubah tipe opsi menjadi STRING
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

      // Dapatkan nominal yang dimasukkan oleh user
      const tradeAmount = parseInt(interaction.options.getString("amount"));

      // Kurangi nominal yang dimasukkan secara acak
      const adjustedAmount = tradeAmount - Math.floor(Math.random() * 51); // Pengurangan acak antara 0 hingga 50

      // Tunggu selama 2 menit sebelum menampilkan hasil trading
      setTimeout(async () => {
        // Lakukan trading
        const result = await performTrading(userId, guildId, adjustedAmount);

        // Update balance user sesuai hasil trading
        updateBalance(userId, guildId, result);

        // Tampilkan hasil trading
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `## TRADE RESULT\n\`\`\`You performed a trade and ${
                  result > 0 ? "gained" : "lost"
                } ${Math.abs(result)} Starcrest.\`\`\``
              )
              .setColor(result > 0 ? 0x00ae86 : 0x4caf50),
          ],
          ephemeral: true,
        });
      }, 1500); // Tunggu selama 2 menit (120.000 milidetik) sebelum menampilkan hasil trading
    } catch (error) {
      console.log(`Error with /trade: ${error}`);
      interaction.editReply({
        content: "An error occurred while processing your trade.",
        ephemeral: true,
      });
    }
  },
};

// Fungsi untuk melakukan trading dan mengembalikan hasil trading
function performTrading(userId, guildId, tradeAmount) {
  return new Promise((resolve, reject) => {
    // Simulasi trading dengan hasil acak antara -100 hingga 100
    const result = Math.floor(Math.random() * 201) - 100;

    // Update balance user sesuai hasil trading
    db.run(
      "UPDATE users SET balance = balance + ? WHERE userId = ? AND guildId = ?",
      [result, userId, guildId],
      (err) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

// Fungsi untuk memperbarui balance user
function updateBalance(userId, guildId, amount) {
  db.run(
    "UPDATE users SET balance = balance + ? WHERE userId = ? AND guildId = ?",
    [amount, userId, guildId],
    (err) => {
      if (err) console.error("Error updating user balance:", err);
    }
  );
}
