import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getAccount } from "../accounts";
import { rawToBaseFormatted } from "../helpers/currency.helpers";
import { receiveAllPending, rpc, sendTransaction } from "../rpc";

const data = new SlashCommandBuilder()
  .setName("nyano-send-max")
  .setDescription("Send all your nyano to an address.")
  .addStringOption(option =>
    option
      .setName("address")
      .setDescription("The address to send nyano to.")
      .setRequired(true)
  );

const execute = async (interaction: CommandInteraction) => {
  const {
    user: { id: userId },
    options,
  } = interaction;
  const account = await getAccount(userId);
  const toAddress = options.get("address")?.value as string;

  if (!toAddress) {
    throw new Error("No address.");
  }

  await interaction.reply("Sending...");

  const resAccountBalance = await rpc.account_balance(account.address);

  if (!resAccountBalance) {
    throw new Error("No balance.");
  }

  const { address: fromAddress, publicKey, secretKey } = account;

  await receiveAllPending({ address: fromAddress, publicKey, secretKey });

  const { balance: balanceRAW } = resAccountBalance;

  if (balanceRAW === "0") {
    return "You have 0 nyano.";
  }

  const balance = rawToBaseFormatted(balanceRAW);

  await sendTransaction({
    fromAddress,
    toAddress,
    amountRAW: balanceRAW,
    secretKey,
  });

  await interaction.editReply(
    `You sent \`${balance} nyano\` to \`${toAddress}\`.`
  );

  return;
};

export { data, execute };
