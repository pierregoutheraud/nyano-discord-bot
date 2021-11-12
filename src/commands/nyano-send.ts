import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getAccount } from "../accounts";
import { receiveAllPending, sendTransaction } from "../rpc";
import { baseToRaw } from "../helpers/currency.helpers";

const data = new SlashCommandBuilder()
  .setName("nyano-send")
  .setDescription("Send nyano to an address.")
  .addStringOption(option =>
    option
      .setName("address")
      .setDescription("The address to send nyano to.")
      .setRequired(true)
  )
  .addNumberOption(option =>
    option
      .setName("amount")
      .setDescription("The amount of nyano to send.")
      .setRequired(true)
  );

const execute = async (interaction: CommandInteraction) => {
  const {
    user: { id: userId },
    options,
  } = interaction;
  const account = await getAccount(userId);

  const toAddress = options.get("address")?.value as string;
  const amount = options.get("amount")?.value as number;

  if (!toAddress || !amount) {
    throw new Error("Wrong options.");
  }

  await interaction.reply("Sending...");

  const { address: fromAddress, publicKey, secretKey } = account;

  await receiveAllPending({ address: fromAddress, publicKey, secretKey });

  const amountRAW = baseToRaw(amount);

  if (!amountRAW) {
    throw new Error("Wrong amount.");
  }

  await sendTransaction({
    fromAddress,
    toAddress,
    amountRAW,
    secretKey,
  });

  await interaction.editReply(
    `You sent \`${amount} nyano\` to \`${toAddress}\`.`
  );

  return;
};

export { data, execute };
