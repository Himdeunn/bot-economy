const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

// Buat tabel market jika belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS market (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemName TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      balance INTEGER NOT NULL
  )
`);

db.run(`ALTER TABLE market ADD COLUMN userId TEXT NOT NULL;`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error adding userId column to market table:", err);
  }
});

db.run(`ALTER TABLE market ADD COLUMN guildId TEXT NOT NULL;`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error adding guildId column to market table:", err);
  }
});

db.run(`ALTER TABLE market ADD COLUMN quantity INTEGER DEFAULT 1;`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error adding quantity column to market table:", err);
  }
});

module.exports = {
  name: "market",
  description: "View items available in the market.",
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

      db.all(
        "SELECT userId, itemName, quantity, balance FROM market",
        async (err, rows) => {
          if (err) {
            console.error("Error querying market database:", err);
            interaction.editReply({
              content: "An error occurred while fetching market items.",
              ephemeral: true,
            });
            return;
          }

          if (rows.length === 0) {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `## Market\n\`\`\`Oh no! The market is currently empty.\nCome back again in a few hours!\`\`\``
                  )
                  .setColor(0xff5733), // Ganti warna yang sesuai
              ],
              ephemeral: true,
            });
            return;
          }

          // Buat embed builder dengan beberapa perbaikan estetika
          const embed = new EmbedBuilder()
            .setDescription(
              `## THE MARKET\n\`\`\`Here are the items available in the market:\`\`\``
            )
            .setColor(0xffffff) // Menambahkan warna ke embed
            .setImage(
              `https://cdn.discordapp.com/attachments/1248487182021300236/1249264243505893418/44148ff27560e919eea6e43367989334.png?ex=6666ab7d&is=666559fd&hm=fad9023eb6599473412f5919aa17af8249a414882d834cc33b7e2e982ad988c1&`
            )
            .setTimestamp(); // Menambahkan timestamp ke embed

          // Loop melalui setiap baris dalam hasil database
          for (const row of rows) {
            // Dapatkan objek user berdasarkan userId
            const seller = await client.users.fetch(row.userId);

            // Tambahkan field ke embed dengan username sebagai gantinya ID
            embed.addFields({
              name: `**⌘ SELLER : ${seller.username.toUpperCase()}**`,
              value: `\`\`\`⌬ ITEM ➬ ${row.itemName}\n⌬ QTY ➬ ${row.quantity}\n⌬ PRICE ➬ ${row.balance} Starcrest\`\`\``,
              inline: false, // Mengatur inline ke false untuk memastikan field tidak sejajar
            });
          }

          // Menampilkan embed
          interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });

          // Send the updated embed as a reply
          interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
      );
    } catch (error) {
      console.log(`Error with /market: ${error}`);
      interaction.editReply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  },
};
