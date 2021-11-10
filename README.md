# Nyano discord bot

<img src="https://i.imgur.com/zIqSbve.png" width="300">

# Install

https://discord.com/api/oauth2/authorize?client_id=907983349954535465&permissions=0&scope=bot%20applications.commands

# Development

## Run script

1. Copy `example.config.json` into a new file named `config.json` by running `cp example.config.json config.json` and fill in you configuration variables.
2. Create a `firebase-credentials.json` file at the root with your `firebase-admin` credentials.
3. Run `yarn dev`.

## Deploy discord commands

`yarn deploy-commands`