import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getAccount } from "../accounts";

const data = new SlashCommandBuilder()
  .setName("nyano-address")
  .setDescription("Display your address.");

const execute = async (interaction: CommandInteraction) => {
  const userId = interaction.user.id;
  const account = await getAccount(userId);
  return `Your address is \`${account.address}\``;
};

export { data, execute };
