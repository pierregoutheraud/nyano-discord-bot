import { megaToRaw, rawToMega } from "nano-unit-converter";

const NYANO_RATIO = 1000000;

/* ------------ GENERIC CONVERT ------------ */

export function rawToBaseStr(amountRAW: string): string | null {
  try {
    return rawToNyano(amountRAW);
  } catch (e) {
    // amountRAW is too small (ex: 0) or too big
    return "0";
  }
}

export function rawToBaseNum(amountRAW: string): number | null {
  const baseStr = rawToBaseStr(amountRAW);
  return baseStr ? parseFloat(baseStr) : null;
}

export function rawToBaseFormatted(
  amountRAW: string,
  formatParams = {}
): string | null {
  const baseStr = rawToBaseStr(amountRAW);
  return baseStr
    ? formatBase(baseStr, {
        stripDecimals: true,
        ...formatParams,
      })
    : null;
}

export function baseToRaw(amount: string | number): string | null {
  try {
    return nyanoToRaw(amount);
  } catch (e) {
    // amountRAW is too small (ex: 0) or too big
    return "0";
  }
}

export function rawToNyano(amountRAW: string): string {
  const str = rawToMega(amountRAW);
  const num = Number(str) * NYANO_RATIO;
  return String(num);
}

export function nyanoToRaw(amount: string | number): string {
  const _amount = Number(amount);
  return megaToRaw(_amount / NYANO_RATIO);
}

// truncate after decimals (toFixed without rounding)
// https://stackoverflow.com/a/11818658/668157
export function truncateDecimals(num: string, fixed = 6): string {
  // truncate
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  const matches = num.match(re);
  if (!matches) {
    return "0";
  }
  const value = matches[0];
  return value;
}

export function formatBase(
  num: number | string,
  { stripDecimals = false, useGrouping = true, maximumFractionDigits = 6 } = {}
): string {
  num = typeof num === "string" ? Number(num) : num;

  // We display numbers as readable strings (without exponent)
  // We do not use grouping for truncate fn to work
  let str = num.toLocaleString("en", {
    minimumFractionDigits: 20,
    useGrouping: false,
  });

  // Truncate decimals to a maximum of 6
  // We don't use maximumFractionDigits because it is rounding
  str = truncateDecimals(str, stripDecimals ? 0 : 6);

  // We parse again to be able to use toLocaleString
  const num2 = parseFloat(str);

  if (num2 === 0) {
    return "0";
  }

  // Final formatting with grouping and maximum fraction digits
  return num2.toLocaleString("en", {
    maximumFractionDigits,
    useGrouping,
  });
}

/* ------------------------------------ */

export function rawAdd(n1: string, n2: string, pad: number = 0) {
  return (BigInt(n1) + BigInt(n2)).toString().padStart(pad, "0");
}

export function rawSub(n1: string, n2: string, pad: number = 0) {
  return (BigInt(n1) - BigInt(n2)).toString().padStart(pad, "0");
}
