# Nyano discord bot

<img src="https://i.imgur.com/zIqSbve.png" width="300">

# Nyano introduction

Nyano is a new representation of nano, not a new coin.<br />
`1 nano = 1,000,000 nyano`

# Install

Use this link to install the bot on your Discord server:
https://discord.com/api/oauth2/authorize?client_id=907983349954535465&permissions=0&scope=bot%20applications.commands

# How does it work?

Type `/` in the discord server to see the commands.

## All commands

`/nyano-address` Display your nyano address.<br/>
`/nyano-balance` Display your nyano balance.<br/>
`/nyano-send {address} {amount}` Send nyano to an address.<br/>
`/nyano-send-max {address}` Send all your nyano to an address.<br/>
`/nyano-tip {username} {amount}` Tip a discord user.<br/>

# Development

## Database

The idea is to have one seed for all discord users. This seed is not stored in database and only set in `config.json` file.<br />
Each user gets a new index and thus one account of this wallet.<br />
Firebase is used to store every users indexes and a global index which is incremented for every new user.

<img src="https://i.imgur.com/1R5pqmi.png" width="300"><br />

## Run script

1. Copy `example.config.json` into a new file named `config.json` by running `cp example.config.json config.json` and fill in you configuration variables.

```javascript
{
  "DISCORD_CLIENT_ID": ""   // Discord client id (Required)
  "DISCORD_TOKEN": "",      // Discord bot token (Required)
  "NANO_SEED": "",          // The seed used to store every users addresses (Required)
  "NANO_NODE_URL": "",      // Nano node url for rpc api (Required)
  "DATABASE_URL": "",       // Your firebase database url (Required)
  "LOGTAIL_KEY": "",        // key from logtail.com (Optional)
}
```

2. Create a `firebase-credentials.json` file at the root with your `firebase-admin` credentials.
3. Run `yarn dev`.

## Deploy discord commands

`yarn deploy-commands`
