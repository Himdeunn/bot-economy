const {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  ComponentType,
} = require("discord.js");

module.exports = async (interaction, pages, time = 30 * 1000) => {
  try {
    if (!interaction || !pages || !pages > 0)
      throw new Error(`Invalid arguments`);

    await interaction.deferReply();

    if (pages.length === 1) {
      return await interaction.editReply({
        embeds: pages,
        components: [],
        fetchReply: true,
      });
    }

    const prev = new ButtonBuilder()
      .setCustomId(`prev`)
      .setEmoji(`⬅️`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const home = new ButtonBuilder()
      .setCustomId(`home`)
      .setEmoji(`🏠`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const next = new ButtonBuilder()
      .setCustomId(`next`)
      .setEmoji(`➡️`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const buttons = new ActionRowBuilder().addComponents([prev, home, next]);
    let index = 0;

    const msg = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttons],
      fetchReply: true,
    });

    const mc = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    mc.on(`collect`, async (i) => {
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          content: `You are not allowed do to this!`,
          ephemeral: true,
        });

      await i.deferUpdate();

      if (i.CustomId === `prev`) {
        if (index > 0) {
          index--;
        } else if (i.customId === `home`) {
          index = 0;
        } else if (i.customId === `next`) {
          if (index < pages.length - 1) {
            index++;
          }
        }

        if (index === 0) {
          prev.setDisabled(true);
          home.setDisabled(true);
        } else {
          prev.setDisabled(false);
          home.setDisabled(false);
        }

        if (index === pages.length - 1) {
          next.setDisabled(true);
        } else {
          next.setDisabled(false);
        }

        await msg.edit({
          embeds: [pages[index]],
          components: [buttons],
        });
      }

      mc.on(`end`, async () => {
        await msg.edit({
          embeds: [pages[index]],
          components: [],
        });
      });

      return msg;
    });
  } catch (error) {
    console.log(error);
  }
};
