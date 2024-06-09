const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'List command di server.',
  
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  async callback(client, interaction) {

    // Mendapatkan server dari interaction
    const guild = interaction.guild;

    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setColor(`Random`)
      .setDescription(`## Help Command From ${client.user.username}\nBelow is a list of commands from the bot ${client.user.username}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
      .setTimestamp(new Date())
      .addFields(
        { name: '☗ BALANCE COMMAND', value: `\`\`\`▪ /daily\n▪ /balance\n▪ /addbalance (Admin Only)\n▪ /setbalance (Admin Only)\n▪ /subtractbalance (Admin Only)\n▪ /lowbalance\n▪ /totalbalance\n▪ /transfer\`\`\``},
        { name: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬', value: `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬` },
        { name: '☗ JOB COMMAND', value: `\`\`\`▪ /jobchoose\n▪ /joblist\n▪ /work\`\`\`` },
        { name: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬', value: `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬` },
        { name: '☗ INVESTMENT COMMAND', value: `\`\`\`▪ /deposit\n▪ /deposit-list\n▪ /trade\`\`\`` },
        { name: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬', value: `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬` },
        { name: '☗ ECONOMY COMMAND', value: `\`\`\`▪ /buy\n▪ /sell\n▪ /market\n▪ /inventory\n▪ /loot\n▪ /lootbox\`\`\`` },
        // Tambahkan perintah lain sesuai kebutuhan
      )
      .setFooter({ text: `${guild.name}` });

    interaction.editReply({ embeds: [embed] });
  },
};