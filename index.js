import { REST, Routes, Client, Events, GatewayIntentBits } from "discord.js";
import 'dotenv/config';
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT = process.env.CLIENT_ID;

const commands = [
    {
        name: 'create-ticket',
        description: 'Create a ticket for further evaluation',
    },
    {
        name: 'telete-ticket',
        description: 'Delete Current ticket',
    },
    {
        name: 'close-ticket', 
        description: 'Close Current Ticket',
    },
    {
        name: 'view-ticket',
        description: 'View {args} tickets in the list',
    },
]

const rest = new REST({ version: '10'}).setToken(TOKEN);

try {
    console.log('Trying to send commands to discord...');

    await rest.put(Routes.applicationCommands(CLIENT), {body: commands});
    console.log('Successfully sent commands!');
} catch (error) {
    console.log('There seems to be an error somewhere along the way');
}

const client = new Client ({ intents: [GatewayIntentBits.Guilds] }); 

client.on(Events.ClientReady, readyClient => {
    console.log('Bot is online!');
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == 'create-ticket') {
        await interaction.reply('Okay');
    }
    if (interaction.commandName == 'delete-ticket') {
        await interaction.reply('Okay');
    }
    if (interaction.commandName == 'close-ticket') {
        await interaction.reply('Okay');
    }
    if (interaction.commandName == 'view-ticket') {
        await interaction.reply('Okay');
    }
})

client.login(TOKEN);



