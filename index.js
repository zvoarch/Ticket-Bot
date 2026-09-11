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

    createTicket(issue, issue_type, date, user){
        this.ticketList.push(new Ticket(issue,issue_type,date,user))
    }
    deleteTicket(id){
        const index = this.ticketList.findIndex(ticket => ticket.id === id);

        if (id == -1) return false;

        this.ticketList.splice(index, 1);
        return true;
    }

    getAvailableTickets(){
        return this.ticketList.slice(0,10);
    }

    closeTicket(id){
        const index = this.ticketList.findIndex(ticket => ticket.id === id);
        const deletedTicket = this.ticketList.splice(index, 1);

        solvedTickets.unshift(deletedTicket);
    }
    getTicketHistory(){
        return this.solvedTickets.splice(0,10);
    }
}

client.login(TOKEN);



