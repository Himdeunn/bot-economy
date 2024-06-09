const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

// Daftar item Minecraft
const minecraftItems = [
  "Wooden Sword",
  "Stone Sword",
  "Iron Sword",
  "Diamond Sword",
  "Golden Sword",
  "Netherite Sword",
  "Wooden Pickaxe",
  "Stone Pickaxe",
  "Iron Pickaxe",
  "Diamond Pickaxe",
  "Golden Pickaxe",
  "Netherite Pickaxe",
  "Wooden Axe",
  "Stone Axe",
  "Iron Axe",
  "Diamond Axe",
  "Golden Axe",
  "Netherite Axe",
  "Leather Helmet",
  "Chainmail Helmet",
  "Iron Helmet",
  "Diamond Helmet",
  "Golden Helmet",
  "Netherite Helmet",
  "Leather Chestplate",
  "Chainmail Chestplate",
  "Iron Chestplate",
  "Diamond Chestplate",
  "Golden Chestplate",
  "Netherite Chestplate",
  "Leather Leggings",
  "Chainmail Leggings",
  "Iron Leggings",
  "Diamond Leggings",
  "Golden Leggings",
  "Netherite Leggings",
  "Leather Boots",
  "Chainmail Boots",
  "Iron Boots",
  "Diamond Boots",
  "Golden Boots",
  "Netherite Boots",
  "Coal",
  "Iron Ingot",
  "Gold Ingot",
  "Diamond",
  "Emerald",
  "Redstone",
  "Lapis Lazuli",
  "Netherite Ingot",
  "Nether Quartz",
  "Apple",
  "Golden Apple",
  "Enchanted Golden Apple",
  "Bread",
  "Cooked Beef (Steak)",
  "Cooked Porkchop",
  "Cooked Chicken",
  "Cooked Mutton",
  "Cooked Rabbit",
  "Cooked Cod",
  "Cooked Salmon",
  "Cake",
  "Pumpkin Pie",
  "Carrot",
  "Baked Potato",
  "Ender Pearl",
  "Blaze Rod",
  "Nether Star",
  "Potion of Healing",
  "Potion of Regeneration",
  "Enchanted Book",
  "Name Tag",
  "Saddle",
  "Elytra",
  "Firework Rocket",
  "Totem of Undying",
  "Oak Wood Planks",
  "Stone",
  "Cobblestone",
  "Sand",
  "Gravel",
  "Dirt",
  "Grass Block",
  "Obsidian",
  "Glass",
  "Nether Bricks",
  "Quartz Block",
  "Bow",
  "Arrow",
  "Shield",
  "Fishing Rod",
  "Flint and Steel",
  "Shears",
  "Compass",
  "Clock",
  "Oak Log",
  "Spruce Log",
  "Birch Log",
  "Jungle Log",
  "Acacia Log",
  "Dark Oak Log",
  "Cherry Log",
  "Crimson Log",
];

// Batasan waktu cooldown dalam milidetik
const COOLDOWN_TIME = 24 * 60 * 60 * 1000; // Satu hari dalam milidetik

// Buat tabel users jika belum ada
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        balance INTEGER DEFAULT 0,
        timestamp INTEGER
    )
`);

// Buat tabel inventory jika belum ada
db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        guildId TEXT NOT NULL,
        itemName TEXT NOT NULL,
        quantity INTEGER DEFAULT 1
    )
`);

db.run(
  `
    ALTER TABLE inventory ADD COLUMN lastLootTime INTEGER;
`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding lastLootTime column to inventory table:", err);
    }
  }
);

module.exports = {
  name: "lootbox",
  description: "Open a lootbox and see what you get!",
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
      const username = interaction.user.username;
      const guildId = interaction.guild.id;
      const currentTime = Date.now();

      // Periksa waktu terakhir pengguna mengambil loot
      db.get(
        "SELECT lastLootTime FROM inventory WHERE userId = ? AND guildId = ? ORDER BY lastLootTime DESC LIMIT 1",
        [userId, guildId],
        (err, row) => {
          if (err) {
            console.error("Error querying inventory database:", err);
            interaction.editReply({
              content: "An error occurred while checking your loot cooldown.",
              ephemeral: true,
            });
            return;
          }

          if (row) {
            const lastLootTime = row.lastLootTime;
            if (lastLootTime && currentTime - lastLootTime < COOLDOWN_TIME) {
              const timeLeft = COOLDOWN_TIME - (currentTime - lastLootTime);
              const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000)); // Hitung jam yang tersisa
              interaction.editReply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      `## Ohh Crapp!!\n### You have a cooldown\n\n\`\`\`⏳ Comeback after ${hoursLeft} hours and then you can loot items again.\`\`\``
                    )
                    .setColor(0xff5733) // Ganti dengan warna yang Anda inginkan
                    .setFooter({ text: "Thank you for your patience!" }),
                ],
                ephemeral: true,
              });
              return;
            }
          }

          // Update waktu terakhir loot
          db.run(
            "INSERT OR REPLACE INTO inventory (userId, guildId, timestamp, lastLootTime) VALUES (?, ?, ?)",
            [userId, guildId, currentTime],
            (err) => {
              if (err) {
                console.error("Error updating last loot time:", err);
                interaction.editReply({
                  content: "An error occurred while updating cooldown.",
                  ephemeral: true,
                });
                return;
              }
            }
          );

          // Tentukan jumlah item yang akan didapat
          const numItems = 3; // Ubah sesuai kebutuhan

          // Inisialisasi array untuk menyimpan item-item yang didapat
          const lootItems = [];

          // Simulasikan membuka lootbox dan pilih item secara acak
          for (let i = 0; i < numItems; i++) {
            const randomItem =
              minecraftItems[Math.floor(Math.random() * minecraftItems.length)];
            lootItems.push(randomItem);
          }

          // Tambahkan item yang didapat ke dalam inventory
          lootItems.forEach((lootItem) => {
            db.run(
              "INSERT INTO inventory (userId, guildId, itemName, lastLootTime) VALUES (?, ?, ?)",
              [userId, guildId, lootItem],
              (err) => {
                if (err) {
                  console.error("Error adding item to inventory:", err);
                  interaction.editReply({
                    content:
                      "An error occurred while adding the item to your inventory.",
                    ephemeral: true,
                  });
                  return;
                }
              }
            );
          });

          // Tampilkan hasil lootbox menggunakan EmbedBuilder
          const embed = new EmbedBuilder()
            .setDescription(
              `### Congratulations \`${username}\`\nYou opened a lootbox and got an items below`
            )
            .addFields(
              lootItems.map((item) => ({
                name: `Congratulations!`,
                value: `\`\`\`${item}\`\`\``,
                inline: true,
              }))
            )
            .setColor(0x00ae86);

          interaction.editReply({
            embeds: [embed],
            ephemeral: true,
          });
        }
      );
    } catch (error) {
      console.log(`Error with /lootbox: ${error}`);
    }
  },
};
