const { Client, Interaction, EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

// Buat atau terhubung ke database SQLite
const db = new sqlite3.Database("./src/database/daily.db");

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
      console.error("Error adding timestamp column to users table:", err);
    }
  }
);

const COOLDOWN_TIME = 60 * 1000; // 1 minute in milliseconds

module.exports = {
  name: "loot",
  description: "Get a random loot item.",
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
              const minutesLeft = Math.ceil(timeLeft / 60000);
              interaction.editReply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      `## Ohh Crapp!!\n### You have a cooldown\n\n\`\`\`⏳ Comeback after ${minutesLeft} minutes and then you can loot items again.\`\`\``
                    )
                    .setColor(0x4CAF50) // Ganti dengan warna yang Anda inginkan
                    .setFooter({ text: "Thank you for your patience!" }),
                ],
                ephemeral: true,
              });
              return;
            }
          }

          // Daftar item loot Minecraft
          const lootItems = [
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

          // Pilih item loot secara acak
          const randomItem =
            lootItems[Math.floor(Math.random() * lootItems.length)];

          // Masukkan item loot ke tabel inventory
          db.run(
            "INSERT INTO inventory (userId, guildId, itemName, lastLootTime) VALUES (?, ?, ?, ?)",
            [userId, guildId, randomItem, currentTime],
            (err) => {
              if (err) {
                console.error("Error adding loot item to inventory:", err);
                interaction.editReply({
                  content:
                    "An error occurred while adding the loot item to your inventory.",
                  ephemeral: true,
                });
                return;
              }

              // Buat embed untuk menampilkan loot
              const embed = new EmbedBuilder()
                .setDescription(
                  `### Congratulations! \`${username}\`\nYou have received a loot item:\n\`\`\`${randomItem}\`\`\``
                )
                .setColor(0x00ae86);

              interaction.editReply({
                embeds: [embed],
                ephemeral: true,
              });
            }
          );
        }
      );
    } catch (error) {
      console.log(`Error with /loot: ${error}`);
    }
  },
};
