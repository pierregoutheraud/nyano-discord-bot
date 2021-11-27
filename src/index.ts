import fs from "fs";
import path from "path";
import { Client, Collection, Intents, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import "./logger";
import { DISCORD_TOKEN } from "../config.json";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => string | null;
}

type ClientWithCommands = Client & { commands?: Collection<string, Command> };

// Create a new client instance
const client: ClientWithCommands = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.commands = new Collection();
fs.readdirSync(path.join(__dirname, "./commands")).forEach((file: string) => {
  const command = require(path.join(__dirname, `./commands/${file}`));
  // Populate Collection with commands
  client.commands!.set(command.data.name, command);
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand() || !client.commands) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return;
  }

  try {
    let replyMessage = await command.execute(interaction);
    if (replyMessage) {
      reply(interaction, replyMessage);
    }
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.message || error.toString();
    reply(interaction, errorMessage);
  }
});

function reply(interaction: CommandInteraction, message: string) {
  if (interaction.replied) {
    interaction.editReply({ content: message });
  } else {
    // ephemeral true => message only the user can see
    interaction.reply({ content: message, ephemeral: false });
  }
}

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);
