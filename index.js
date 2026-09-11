import { REST, Routes, Client, Events, GatewayIntentBits } from "discord.js";
import 'dotenv/config';
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT = process.env.CLIENT_ID;

const commands = [
    {
        name: 'create-ticket',
        description: 'Create a ticket for further evaluation',
        options: [
            {
                name: 'issue-type',
                description: 'What type of issue is this server, member, or program',
                type: 3,
                required: true,
            },
            {
                name: 'issue',
                description: 'What is the issue?',
                type: 3,
                required: true,
            }
        ]
    },
    {
        name: 'delete-ticket',
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
    console.log(error);
}

const client = new Client ({ intents: [GatewayIntentBits.Guilds] }); 

client.on(Events.ClientReady, readyClient => {
    console.log('Bot is online!');
})

const serverTickets = new Map();

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName == 'create-ticket') {

        const ticket = new Ticket(
            interaction.options.getString('issue'),
            interaction.options.getString('issue-type'),
            new Date().toDateString(),
            interaction.user.username
        );
        
        if (!serverTickets.has(interaction.guildId)){
            serverTickets.set(interaction.guildId, new TicketQueue());
        }
        serverTickets.get(interaction.guildId).addTicket(ticket);

        await interaction.reply("Ticket Successfully Created!");
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

class Ticket {

    static nextID = 1;
    constructor(issue, issue_type, date, user ){
        this.id = Ticket.nextID++;
        this.issue = issue;
        this.issue_type = issue_type;
        this.date = date;
        this.user = user
    }
}

class TicketQueue {
    constructor(){
        this.ticketList = [];
        this.solvedTickets = [];
    }

    addTicket(Ticket){
        this.ticketList.push(Ticket);
    }
    deleteTicket(id){
        const index = this.ticketList.findIndex(ticket => ticket.id === id);

        if (index == -1) return false;

        this.ticketList.splice(index, 1);
        return true;
    }

    getAvailableTickets(){
        return this.ticketList.slice(0,10);
    }

    closeTicket(id){
        const index = this.ticketList.findIndex(ticket => ticket.id === id);
        const deletedTicket = this.ticketList.splice(index, 1)[0];

        solvedTickets.unshift(this.deletedTicket);
    }
    getTicketHistory(){
        return this.solvedTickets.slice(0,10);
    }
}

client.login(TOKEN);



