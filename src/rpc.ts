import * as nanocurrency from "nanocurrency";
import { NanoClient } from "@dev-ptera/nano-node-rpc";
import { rawAdd, rawSub } from "./helpers/currency.helpers";
import { NANO_NODE_URL } from "../config.json";

export const rpc = new NanoClient({ url: NANO_NODE_URL });

const DEFAULT_REPRESENTATIVE =
  "nano_1center16ci77qw5w69ww8sy4i4bfmgfhr81ydzpurm91cauj11jn6y3uc5y";

enum SUBTYPE {
  SEND = "send",
  RECEIVE = "receive",
}

export async function sendTransaction({
  fromAddress,
  toAddress,
  secretKey,
  amountRAW,
}: {
  fromAddress: string;
  toAddress: string;
  secretKey: string;
  amountRAW: string;
}) {
  console.log(
    `sendTransaction ${amountRAW} from ${fromAddress} to ${toAddress}`
  );

  let accountInfo;

  try {
    accountInfo = await rpc.account_info(fromAddress, {
      representative: true,
    });
  } catch (e) {
    throw new Error("You have `0 nyano.`");
  }

  if (!accountInfo) {
    throw new Error("You have `0 nyano.`");
  }

  if (!accountInfo) {
    throw new Error("No nano in your account.");
  }

  const { balance: balanceRAW, representative, frontier } = accountInfo;

  if (!amountRAW) {
    throw new Error("No amount raw.");
  }

  if (!representative) {
    throw new Error("No representative.");
  }

  if (balanceRAW === "0") {
    throw new Error("You have `0 nyano.`");
  }

  const newBalanceRAW = rawSub(balanceRAW, amountRAW);

  const work = await workHelper({
    hash: frontier,
    subtype: SUBTYPE.SEND,
  });

  const resBlock = nanocurrency.createBlock(secretKey, {
    work,
    previous: frontier,
    representative,
    balance: newBalanceRAW,
    link: toAddress,
  });

  return process(resBlock.block, SUBTYPE.SEND);
}

async function workHelper({
  hash,
  subtype,
}: {
  hash: string;
  subtype: SUBTYPE;
}) {
  const resActiveDifficulty = await rpc.active_difficulty();
  const { network_current, network_receive_current } = resActiveDifficulty;

  const workThreshold =
    subtype == SUBTYPE.RECEIVE ? network_receive_current : network_current;

  try {
    const workRes = await work_generate(hash, workThreshold);
    return workRes.work;
  } catch (e) {
    console.log("work_generate error", e);
    throw e;
  }
}

async function receive({
  address,
  publicKey,
  secretKey,
  hash,
}: {
  address: string;
  publicKey: string;
  secretKey: string;
  hash: string;
}) {
  console.log("RECEIVE in address " + address + " from block " + hash);

  const block = await block_info(hash);

  let representative;
  let previous;
  let oldBalance;
  let workHash;
  let subtype = SUBTYPE.RECEIVE;

  try {
    const account = await rpc.account_info(address, { representative: true });
    representative = account.representative;
    previous = account.frontier;
    oldBalance = account.balance;
    workHash = account.frontier;
  } catch (e) {
    representative = DEFAULT_REPRESENTATIVE;
    previous = "0".padStart(64, "0");
    oldBalance = "0";
    workHash = publicKey;
  }

  // Request work be computed
  const work = await workHelper({
    hash: workHash,
    subtype,
  });

  // Calculate the new balance of the account
  const new_balance = rawAdd(oldBalance, block.amount);

  // Create receive block
  const resBlock = nanocurrency.createBlock(secretKey, {
    work,
    previous,
    representative: representative!,
    balance: new_balance,
    link: hash,
  });

  return process(resBlock.block, subtype);
}

export async function receiveAllPending({
  address,
  publicKey,
  secretKey,
}: {
  address: string;
  publicKey: string;
  secretKey: string;
}) {
  const res = await pending(address);
  const pendingBlocks = res.blocks;

  console.log(
    `receiveAllPending ${address} - ${
      Object.keys(pendingBlocks).length
    } blocks pending...`
  );

  if (pendingBlocks.length === 0) {
    return;
  }

  for (let hash of pendingBlocks) {
    const response = await receive({
      address,
      publicKey,
      secretKey,
      hash,
    });

    if (response.hash !== undefined) {
      console.log("Receive block", response.hash);
    } else {
      console.error(response);
    }
  }
}

/* -------------------------------------------------------------------------- */

// Missing functions from rpc client

function work_generate(hash: string, difficulty: string) {
  return (
    rpc
      // @ts-ignore
      ._send("work_generate", {
        json_block: true,
        hash,
        difficulty,
        use_peers: true,
      })
  );
}

function block_info(hash: string) {
  return (
    rpc
      // @ts-ignore
      ._send("block_info", {
        json_block: true,
        hash,
      })
  );
}

function pending(
  account: string,
  include_only_confirmed = true,
  count: number = 50
) {
  return (
    rpc
      // @ts-ignore
      ._send("pending", {
        account,
        count,
        include_only_confirmed,
      })
  );
}

function process(block: any, subtype: SUBTYPE) {
  return (
    rpc
      // @ts-ignore
      ._send("process", {
        json_block: true,
        block,
      })
  );
}

export function account_balance(account: string) {
  return (
    rpc
      // @ts-ignore
      ._send("account_balance", {
        account,
        include_only_confirmed: false,
      })
  );
}
