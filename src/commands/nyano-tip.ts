import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getAccount } from "../accounts";
import { baseToRaw } from "../helpers/currency.helpers";
import { sendTransaction } from "../rpc";

const data = new SlashCommandBuilder()
  .setName("nyano-tip")
  .setDescription("Send nyano to a discord user.")
  .addUserOption(option =>
    option
      .setName("user")
      .setDescription("The discord user to send to.")
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
    user: { id: fromUserId },
    options,
  } = interaction;
  const fromAccount = await getAccount(fromUserId);

  const amount = options.get("amount")?.value as number;
  const userOption = options.get("user");

  if (!userOption || !amount) {
    throw new Error("Wrongs options.");
  }

  const amountRAW = baseToRaw(amount);

  if (!amountRAW) {
    throw new Error("Amount raw incorrect.");
  }

  const userId = userOption.value as string;

  const toAccount = await getAccount(userId);

  if (!toAccount) {
    throw new Error("User not found.");
  }

  const { address: fromAddress, secretKey } = fromAccount;
  const { address: toAddress } = toAccount;

  await sendTransaction({
    fromAddress,
    toAddress,
    amountRAW,
    secretKey,
  });

  return `\`${amount} nyano\` sent to \`${toAddress}\`.`;
};

export { data, execute };
