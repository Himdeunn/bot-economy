const {
  Client,
  Interaction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} = require("discord.js");
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

db.run(
  `
    ALTER TABLE users ADD COLUMN job TEXT;
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

module.exports = {
  name: "jobchoose",
  description: "Choose your job.",
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

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select-job")
        .setPlaceholder("Choose your job")
        .addOptions([
          {
            label: '⛏️ Miner',
            description: 'Work as a Miner',
            value: 'miner'
          },
          {
            label: '🌾 Farmer',
            description: 'Work as a Farmer',
            value: 'farmer'
          },
          {
            label: '🏗️ Builder',
            description: 'Work as a Builder',
            value: 'builder'
          },
          {
            label: '🧭 Explorer',
            description: 'Work as an Explorer',
            value: 'explorer'
          },
          {
            label: '🛠️ Crafter',
            description: 'Work as a Crafter',
            value: 'crafter'
          },
          {
            label: '📜 Enchanter',
            description: 'Work as an Enchanter',
            value: 'enchanter'
          },
          {
            label: '🧟 Monster Hunter',
            description: 'Work as a Monster Hunter',
            value: 'monster Hunter'
          },
          {
            label: '🔧 Redstone Engineer',
            description: 'Work as a Redstone Engineer',
            value: 'redstone Engineer'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.editReply({
        content: "Please choose your job:",
        components: [row],
      });

      const filter = (i) => i.customId === "select-job" && i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        const chosenJob = i.values[0];
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Simpan pekerjaan yang dipilih ke dalam database
        db.run(
          "UPDATE users SET job = ? WHERE userId = ? AND guildId = ?",
          [chosenJob, userId, guildId],
          (err) => {
            if (err) {
              console.error("Error updating job in database:", err);
              i.update({
                content: "An error occurred while updating your job.",
                components: [],
                ephemeral: true,
              });
              return;
            }

            i.update({
              content: `Your job has been set to **${chosenJob}**.`,
              components: [],
            });
          }
        );
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({
            content: "You did not choose a job in time.",
            components: [],
          });
        }
      });
    } catch (error) {
      console.log(`Error with /jobchoose: ${error}`);
    }
  },
};
