import { Logtail } from "@logtail/node";
import { LOGTAIL_KEY } from "../config.json";

export const logtail = LOGTAIL_KEY ? new Logtail(LOGTAIL_KEY) : null;

const _console = { ...global.console };

global.console.log = (...params) => {
  _console.log(...params);
  if (logtail) {
    const content = params.map(p => JSON.stringify(p)).join(" ");
    logtail.info(content);
  }
};
