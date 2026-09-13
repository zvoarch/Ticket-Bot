import { REST, Routes, Client, Events, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { path } from "node.path";
import 'dotenv/config';
import fs from "fs";
import fsPromises from "fs/promises";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

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
        options: [
            {
                name: 'id',
                description: "Please include ID of the ticket you would like removed",
                type: 3,
                required: true,
            }
        ]
    },
    {
        name: 'close-ticket', 
        description: 'Close Current Ticket',
        options: [
            {
                name: 'id',
                description: 'Please include the ID of the ticket you would like to close',
                type: 3,
                required: true,
            }
        ]
    },
    {
        name: 'view-solved-tickets',
        description: 'View most current 10 solved tickets in the list',
    },
    {
        name: 'view-tickets',
        description: 'View 10 tickets in the list',
    },
]

const rest = new REST({ version: '10'}).setToken(TOKEN);

try {
    console.log('Trying to send commands to discord...');

    await rest.put(Routes.applicationGuildCommands(CLIENT,GUILD_ID), {body: commands});
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
        
        if (!serverTickets.has(interaction.guildId)){
            serverTickets.set(interaction.guildId, new TicketQueue());
        }
        serverTickets.get(interaction.guildId).createTicket(
            interaction.options.getString('issue'),
            interaction.options.getString('issue-type'),
            new Date().toDateString(),
            interaction.user.username
        );
        await writeJSONFile()
        await interaction.reply("Ticket Successfully Created!");
    }
    if (interaction.commandName == 'delete-ticket') {
        const queue = serverTickets.get(interaction.guildId);
        const id = Number(interaction.options.getString('id'));

        if(!queue){
            await interaction.reply('There are no tickets in the server');
        } else if (!queue.hasTicket(id)){
            await interaction.reply('Couldn\'t find a ticket with that ID');
        } else if (!queue.deleteTicket(id)){
            await interaction.reply('Ticket not found');
        } else {
           await writeJSONFile()
           await interaction.reply('Ticket Successfully Deleted');
        }
    }
    if (interaction.commandName == 'close-ticket') {
        const queue = serverTickets.get(interaction.guildId);
        const id = Number(interaction.options.getString('id'));

        if(!queue){
            await interaction.reply('There are no tickets in the server');
        } else if (!queue.hasTicket(id)){
            await interaction.reply('Couldn\'t find a ticket with that ID');
        } else if (!queue.closeTicket(id)){
            await interaction.reply('Ticket not found');
        } else {
            await writeJSONFile()
            await interaction.reply('Ticket Successfully Closed!');
        }
    }
    if (interaction.commandName == 'view-tickets') {
        let result = "";
        const queue = serverTickets.get(interaction.guildId);

        if (!queue) {
            await interaction.reply('There are no active tickets in the server.');
        }
        else if (queue.getAvailableTickets().length === 0) {
            await interaction.reply('There are no current active tickets.');
        }
        else {
            for (const item of queue.getAvailableTickets()){
            result += item.toString() + "\n";
            }
            await interaction.reply(result);
        }
        
    }

    if (interaction.commandName == 'view-solved-tickets') {
        let result = "";
        const queue = serverTickets.get(interaction.guildId);

        if (!queue) {
            await interaction.reply('There is no solved tickets in the server');
        }
        else if (queue.getTicketHistory().length === 0) {
            await interaction.reply('There are no solved tickets.');
        }
        else {
            for (const item of queue.getTicketHistory()){
            result += item.toString() + "\n";
            }
            await interaction.reply(result);
        }
    }
})

class Ticket {

    static nextID = 1;

    constructor(issue, issue_type, date, user) {
        this.id = Ticket.nextID++;
        this.issue = issue;
        this.issue_type = issue_type;
        this.date = date;
        this.user = user;
    }

    toString(){
        return `Issue Type: ${this.issue_type}, Issue: ${this.issue}, User: ${this.user}, Date: ${this.date}, ID: ${this.id}`; 
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
        if (index === -1) {
            return false;  
        } else {
            this.ticketList.splice(index, 1);
            return true;
        }
    }
    getAvailableTickets(){ 
        return this.ticketList.slice(0,10); 
    } 
    getTicketHistory(){
        return this.solvedTickets.slice(0,10); 
    } 
    closeTicket(id) {
    const index = this.ticketList.findIndex(ticket => ticket.id === id);

    if (index === -1) {
        return false;
    }

    const deletedTicket = this.ticketList.splice(index, 1)[0];
    this.solvedTickets.unshift(deletedTicket);

    return true;
    }
    
    hasTicket(id){
        return this.ticketList.some(ticket => ticket.id === id);
    }

}

readJSONFile();
client.login(TOKEN);

async function writeJSONFile(){
    try {
        let objectFromMap = Object.fromEntries(serverTickets);
        let mapToString = JSON.stringify(objectFromMap, null, 2);
        await fsPromises.writeFile('/Users/ramir/discord-ticket-bot/tickets.json', mapToString);

    } catch (error){
        console.log(error);
    }
}

function readJSONFile(){
    try {
        const dataString = fs.readFileSync(
            '/Users/ramir/discord-ticket-bot/tickets.json',
            'utf8'
        );

        const ticketObject = JSON.parse(dataString);

        let highestID = 0;

        Object.entries(ticketObject).forEach(([key, value]) => {
            const queue = new TicketQueue();

            queue.ticketList = value.ticketList.map(ticket => {
                const newTicket = new Ticket(
                    ticket.issue,
                    ticket.issue_type,
                    ticket.date,
                    ticket.user
                );

                newTicket.id = ticket.id;

                if (ticket.id > highestID) {
                    highestID = ticket.id;
                }

                return newTicket;
            });

            queue.solvedTickets = value.solvedTickets.map(ticket => {
                const newTicket = new Ticket(
                    ticket.issue,
                    ticket.issue_type,
                    ticket.date,
                    ticket.user
                );

                newTicket.id = ticket.id;

                if (ticket.id > highestID) {
                    highestID = ticket.id;
                }

                return newTicket;
            });

            serverTickets.set(key, queue);
        });

        Ticket.nextID = highestID + 1;

    } catch (error){
        console.log(error);
    }
}