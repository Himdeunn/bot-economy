const { Client, Interaction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "joblist",
  description: "View the list of available jobs.",
  callback: async (client, interaction) => {

    const image = `https://cdn.discordapp.com/attachments/1170405002448207913/1230923619245363201/minecraft_aesthetics_shaders.jpeg?ex=66595734&is=665805b4&hm=a14b6e67e7d91a4824b3887b129b2935a1de2229894eec0e1c03673942032e26&`;

    try {
      await interaction.deferReply();

      // Buat pesan embed untuk menampilkan daftar pekerjaan beserta deskripsinya
      const embed = new EmbedBuilder()
        .setTitle("List of Available Jobs")
        .setColor("#7289DA")
        .setDescription("Here is a list of available jobs and their descriptions:")
        .setImage(image)
        .addFields(
          { name: "1. ⛏️ Miner", value: "Miners search for and collect various mineral blocks, such as coal, iron, gold, and diamond." },
          { name: "2. 🌾 Farmer", value: "Farmers are responsible for planting and tending to crops, such as wheat, potatoes, carrots, and farming animals like cows and sheep." },
          { name: "3. 🏗️ Builder", value: "Builders construct structures and buildings in the Minecraft world, including houses, castles, and other infrastructure." },
          { name: "4. 🧭 Explorer", value: "Explorers venture out into the Minecraft world to discover new locations, resources, and unique structures, such as exotic biomes, ancient temples, and NPC villages." },
          { name: "5. 🛠️ Crafter", value: "Crafters craft various items and blocks using gathered materials, such as weapons, tools, and building materials." },
          { name: "6. 🔧 Redstone Engineer", value: "Redstone engineers utilize redstone skills to create machines and mechanical devices, including automatic doors, traps, and automation systems." },
          { name: "7. 📜 Enchanter", value: "Enchanters use enchanting tables to bestow magical effects on tools and equipment, such as critical power and additional protection." },
          { name: "8. 🧟 Monster Hunter", value: "Monster hunters protect settlements and other players from monster attacks, including zombies, creepers, and other hostile creatures." }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(`Error with /joblist: ${error}`);
      await interaction.editReply({
        content: "An error occurred while fetching the job list.",
        ephemeral: true,
      });
    }
  },
};
