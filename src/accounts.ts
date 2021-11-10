import * as nanocurrency from "nanocurrency";
import { NANO_SEED } from "../config.json";
import { rdb } from "./database/firebase";

export async function getAccount(userId: string) {
  const index = await getWalletIndex(userId);

  const secretKey = nanocurrency.deriveSecretKey(NANO_SEED, index);
  const publicKey = nanocurrency.derivePublicKey(secretKey);
  const address = nanocurrency
    .deriveAddress(publicKey)
    .replace("xrb_", "nano_");

  return {
    seed: NANO_SEED,
    secretKey,
    publicKey,
    address,
    index,
  };
}

async function getWalletIndex(userId: string) {
  try {
    const snap = await rdb.ref(`users/${userId}`).once("value");

    if (snap.exists()) {
      return snap.val();
    }

    // Get new unique index
    const result = await rdb
      .ref("index")
      .transaction((index: number | null) => {
        return (index ?? 0) + 1;
      });

    const newIndex = result.snapshot.val();

    // Store user index
    await rdb.ref(`users/${userId}`).set(newIndex);
    return newIndex;
  } catch (e) {
    throw new Error("Error with your wallet index.");
  }
}
