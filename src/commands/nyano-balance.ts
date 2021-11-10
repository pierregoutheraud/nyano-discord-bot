import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getAccount } from "../accounts";
import { account_balance, receiveAllPending, rpc } from "../rpc";
import { rawAdd, rawToBaseFormatted } from "../helpers/currency.helpers";

const data = new SlashCommandBuilder()
  .setName("nyano-balance")
  .setDescription("Display your balance.");

const execute = async (interaction: CommandInteraction) => {
  const userId = interaction.user.id;
  const account = await getAccount(userId);

  if (!account) {
    throw new Error("No account.");
  }

  const { address, publicKey, secretKey } = account;

  receiveAllPending({ address: address, publicKey, secretKey });

  const res = await account_balance(account.address);

  if (!res) {
    throw new Error("No account.");
  }

  const { balance: balanceRAW, pending: pendingRAW } = res;

  const amountRAW = rawAdd(balanceRAW, pendingRAW);
  const amountFormatted = rawToBaseFormatted(amountRAW);

  return `You have \`${amountFormatted} nyano\`.`;
};

export { data, execute };
