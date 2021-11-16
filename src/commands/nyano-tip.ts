import { ClientUser, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getAccount, User } from "../accounts";
import { baseToRaw, rawAdd } from "../helpers/currency.helpers";
import { sendTransaction } from "../rpc";
import { rdb } from "../database/firebase";

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

  if (!userOption || !amount || isNaN(amount)) {
    throw new Error("Wrongs options.");
  }

  const user = userOption.user as ClientUser;

  const amountRAW = baseToRaw(amount);

  if (!amountRAW) {
    throw new Error("Amount raw incorrect.");
  }

  const { id: userId } = user;

  const toAccount = await getAccount(userId);

  if (!toAccount) {
    throw new Error("User not found.");
  }

  await interaction.reply("Sending...");

  const { address: fromAddress, secretKey } = fromAccount;
  const { address: toAddress } = toAccount;

  await sendTransaction({
    fromAddress,
    toAddress,
    amountRAW,
    secretKey,
  });

  // Will be usefull to create a leaderboard of biggest tippers
  rdb.ref(`users/${fromUserId}/tipped`).transaction((tipped: string | null) => {
    const prevTipped = tipped || "0";
    return rawAdd(prevTipped, amountRAW);
  });

  await interaction.editReply(`You sent \`${amount} nyano\` to <@${userId}>`);

  return;
};

export { data, execute };
