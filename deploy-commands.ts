const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = require("./config.json");
const fs = require("fs");
import { Command } from "./src/index";

const commandsData = fs
  .readdirSync("./src/commands")
  .map((file: any) => file.replace(".ts", ".js"))
  .map((file: string) => {
    const cmd = require(`./src/commands/${file}`);
    return cmd;
  })
  .map((command: Command) => command.data.toJSON());

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

console.log("commandsData:", commandsData);

rest
  .put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
    body: commandsData,
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
