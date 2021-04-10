# snanscounter
A bot that adds 1 to the SnanS Counter for each 'SnanS' that is said.

[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=423277261123223562&permissions=3072&scope=bot)

## Technical Details
The bot runs via Node.js. It requires the discord.js and mysql packages.

A MySQL database must be setup before use. The database should have a table named "snans" with rows "server" (varchar(18)) and "count" (int).
