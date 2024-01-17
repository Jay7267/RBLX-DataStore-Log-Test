const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Datastore } = require('rblx.js');
const request = require('request');
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

function getIdFromUser(username) {
  return new Promise((resolve, reject) => {
    var options = {
      'method': 'POST',
      'url': 'https://users.roblox.com/v1/usernames/users',
      'headers': {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "usernames": [username],
        "excludeBannedUsers": true
      })
    };

    request(options, function (error, response) {
      if (error) {
        reject(error);
      } else {
        const responseData = JSON.parse(response.body);
        resolve(responseData);
      }
    });
  });
}

function getUserPFP(userId) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
            'headers': {
            'accept': 'application/json'
            }
        };

        request(options, function (error, response) {
            if (error) {
              reject(error);
            } else {
              const responseData = JSON.parse(response.body);
              resolve(responseData.data[0]?.imageUrl);
            }
        });

    });
}

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activities: [{ name: 'Bot Made By arifexta' }], status: 'online' });
   // client.user.setUsername('Stat Utility Bot')
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('-getstats')) return;
  
    const args = message.content.slice('-getstats'.length).trim();
    const username = args;
  
    try {
        const userResponse = await getIdFromUser(username);
        const userId = userResponse.data[0]?.id; // Assuming the response has a "data" property and you want the first user's ID
        const datastore = new Datastore(process.env.UNIVERSE_ID, process.env.OPENCLOUD_API_KEY);
        const stats = await datastore.GetAsync(process.env.DATASTORE_NAME, userId);

        const PFPUrl = await getUserPFP(userId);
    
        const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`${username}'s Stats`)
        .setDescription(`Successfully retrieved`)
        .addFields({ name: 'Level', value: `\`${stats.Level}\``, inline: true })
        .addFields({ name: 'Credits', value: `\`${stats.Credits}\``, inline: true })
        .setTimestamp()
        .setThumbnail(PFPUrl)
        .setFooter({ text: process.env.GAME_OR_GROUP_NAME, iconURL: process.env.GAME_OR_GROUP_ICON });

        message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while fetching user data.');
    }
});
  

client.login(process.env.BOT_TOKEN);
