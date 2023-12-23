# name-who

A Discord game where participants guess characters depicted in artistic images.

## Run locally

### Clone repository

```
git clone https://github.com/AudioVisuaali/name-who.git name-who
```

### Create `.env` file

Copy `.env.example` and create a new file `.env` in the same directory

### Create bot credentials

`token` and `clientId` are needed

Enable `PUBLIC BOT` to invite to any server by related owner
Enable `MESSAGE CONTENT INTENT` to allow the bot to read incoming messages

```
https://discord.com/developers/applications/<ID_HERE>/bot
```

### Build container

!! Requires Docker

!! Run command in project root

```
docker build -t name-who .
```

### Run container

```
docker run --env-file .env -t name-who
```

### Invite to discord server

Replace id with your own id

```
permissions=2147484736

Read Messages/View Channels
Add Reactions
Use Slash Commands
```

```
https://discord.com/api/oauth2/authorize?client_id=<APPLICATION_ID>&permissions=2147484736&scope=bot+applications.commands
```

### Start game in discord

Start following in chat to access the command. Discord autofill the rest

```
/namewho ....
```

## Development

### Install packages

```
npm install
```

### Run dev

```
# No notreload cuz too lazy to install nodemon and discord rate limits
npm run dev
```

