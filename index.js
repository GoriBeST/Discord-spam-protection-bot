const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ]
});

const spamThreshold = 5; // メッセージ数
const timeWindow = 10000; // 時間 (ミリ秒)
const warningThreshold = 3; // 警告回数
const muteDuration = 60 * 60 * 1000; // ミュートの期間 (ミリ秒)
const userMessages = new Map(); // ユーザーごとのメッセージタイムスタンプと警告カウントを記録

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const now = Date.now();
    const userId = message.author.id;

    if (!userMessages.has(userId)) {
        userMessages.set(userId, { timestamps: [], warnings: 0, muted: false }); // muted プロパティを追加
    }

    const userData = userMessages.get(userId);
    userData.timestamps.push({ timestamp: now, message: message });

    userData.timestamps = userData.timestamps.filter(log => now - log.timestamp <= timeWindow);

    if (userData.timestamps.length >= spamThreshold) {
        userData.warnings += 1;

        if (userData.warnings >= warningThreshold && !userData.muted) { // muted プロパティでミュート済みかどうかを確認
            const member = message.guild.members.cache.get(userId);
            if (member) {
                let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
                if (!muteRole) {
                    try {
                        muteRole = await message.guild.roles.create({
                            name: 'Muted',
                            permissions: [],
                        });
                        await addMuteRoleToChannels(message.guild, muteRole);
                        console.log('Created new Muted role.');
                    } catch (error) {
                        console.error('Failed to create Muted role:', error);
                        return;
                    }
                }

                if (muteRole) {
                    try {
                        await member.roles.add(muteRole);
                        setTimeout(() => {
                            member.roles.remove(muteRole).catch(console.error);
                        }, muteDuration);
                        message.channel.send(`${message.author} has been muted for spamming.`);
                        userData.muted = true; // ミュート済みフラグをセット
                    } catch (error) {
                        console.error('Failed to add Muted role to member:', error);
                    }
                }
            }
        } else {
            message.channel.send(`${message.author}, please stop spamming. This is warning ${userData.warnings}.`);
        }

        userData.timestamps.forEach(log => {
            if (!log.message.deleted) {
                log.message.delete().catch(error => {
                    console.error('Failed to delete message:', error);
                });
            }
        });

        userData.timestamps = [];
    }

    userMessages.set(userId, userData);
});

// ユーザーをミュートするためのヘルパー関数
async function addMuteRoleToChannels(guild, muteRole) {
    const textChannels = guild.channels.cache.filter(channel => 
        channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement
    );
    const voiceChannels = guild.channels.cache.filter(channel => 
        channel.type === ChannelType.GuildVoice
    );
    
    for (const channel of [...textChannels.values(), ...voiceChannels.values()]) {
        try {
            if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
                await channel.permissionOverwrites.create(muteRole, {
                    [PermissionFlagsBits.SendMessages]: false,
                    [PermissionFlagsBits.AddReactions]: false
                });
                console.log(`Muted role added to ${channel.name}.`);
            } else if (channel.type === ChannelType.GuildVoice) {
                await channel.permissionOverwrites.create(muteRole, {
                    [PermissionFlagsBits.Speak]: false,
                    [PermissionFlagsBits.Stream]: false,
                    [PermissionFlagsBits.Connect]: false
                });
                console.log(`Muted role added to ${channel.name}.`);
            }
        } catch (error) {
            console.error(`Failed to add mute role to ${channel.name}:`, error);
        }
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
