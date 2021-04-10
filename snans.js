#!/usr/bin/env node
// for systemctl

// Start with TOKEN='<discord bot token>' MYSQL_HOST='<host ip>' MYSQL_USER='<username>' MYSQL_PASSWORD='<password>' MYSQL_DATABASE='<database>' node ./snans.js

'use strict';

const Discord = require('discord.js');
const mysql = require('mysql');
const client = new Discord.Client();

const regex = /snans/gi;
const helpRegex = /help$/gi;
var globalCount = 0;
var counts = new Map();
const helpEmbed = {
    color: 0xf7971d,
    title: "SnanS Counter",
    fields: [
        {
            name: "Info",
            value: "A bot that adds 1 to the SnanS Counter for each 'SnanS' that is said."
        },
        {
            name: "Links",
            value: "[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=423277261123223562&permissions=3072&scope=bot) | [GitHub](https://github.com/LikeableLiquidz/snanscounter)"
        }
    ]
}

var pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.user.setActivity("Global Counter: " + globalCount);
    console.log("Bot is in " + client.guilds.cache.size + " servers");
})

// Startup
pool.query("SELECT * FROM snans", function (error, results) {
    if (error) throw error;
    results.forEach(row => {
        counts.set(row.server, row.count);
        globalCount += row.count;
    })
})


client.on("message", message => {
    if (regex.test(message.content)) {
        if (!message.guild || message.author == client.user) return;

        let matches = message.content.match(regex).length;
        let count = counts.get(message.guild.id);

        if (count) {
            count += matches;
            globalCount += matches;
            counts.set(message.guild.id, count);

            message.channel.send("SnanS Counter: " + count)
            .catch(console.warn)

            pool.query("UPDATE snans SET count = ? WHERE server = ?", [count, message.guild.id], function (error, results) {
                if (error) {
                    console.error(error);
                } else {
                    console.log(`Updated entry ${message.guild.id} with ${count}`);
                }
            })

            client.user.setActivity("Global Counter: " + globalCount);

        } else {
            count = matches;
            globalCount += matches;
            counts.set(message.guild.id, count);

            message.channel.send("SnanS Counter: " + count)
            .catch(console.warn)

            pool.query("INSERT INTO snans (server, count) VALUES (?, ?)", [message.guild.id, count], function (error, results) {
                if (error) {
                    console.error(error);
                } else {
                    console.log(`Added entry for ${message.guild.id} with value ${count}`);
                }
            })

            client.user.setActivity("Global Counter: " + globalCount);
        }
    }

    if (message.mentions.has(message.guild.me)) {
        if (!message.author.bot && helpRegex.test(message.content)) {
            message.channel.send({embed: helpEmbed});
        }
    }
})

// Use bot token from https://discord.com/developers/applications/
client.login(process.env.TOKEN);
