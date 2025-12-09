/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ananselm <ananselm@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/09 10:38:12 by ananselm          #+#    #+#             */
/*   Updated: 2025/12/09 10:46:05 by ananselm         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import modules
import { 
    Client, 
    Events, 
    GatewayIntentBits, 
    ActivityType, 
    PermissionsBitField, 
    Collection, 
    EmbedBuilder 
} from 'discord.js';

import read from 'fs-readdir-recursive';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

// __dirname equivalent in ES modules
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import commands
const slashFiles = read('./src/Interaction/Slash').filter(file => file.endsWith('.js'));
const contextFiles = read('./src/Interaction/Context-Menu').filter(file => file.endsWith('.js'));
const buttonFiles = read('./src/Interaction/Button').filter(file => file.endsWith('.js'));
const selectMenuFiles = read('./src/Interaction/Select-Menu').filter(file => file.endsWith('.js'));
const modalsFiles = read('./src/Interaction/Modals').filter(file => file.endsWith('.js'));


// Create bot
const bot = new Client({intents: [GatewayIntentBits.Guilds,
                                GatewayIntentBits.GuildMessages,
                                GatewayIntentBits.GuildVoiceStates,
                                GatewayIntentBits.MessageContent]
});

bot.commands = new Collection();
function loadCommands(commandsPath) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commandFolders = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            bot.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    for (const folder of commandFolders) {
        loadCommands(path.join(commandsPath, folder));
    }
}

const foldersPath = path.join(__dirname, 'src/Interaction');
loadCommands(foldersPath);

bot.once(Events.ClientReady, client => {
    console.log("RoboQuack");
    console.log("Version : 1.0.0");
    console.log(`Bot tag : ${client.user.tag}`);
    console.log(`Bot ID : ${client.user.id}`);
    console.log("By ananselm");
    console.log("=====================================")
    client.user.setActivity("Quack", {type: ActivityType.Playing});
})

bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
})

// Interaction (AUTO IMPLEMENTATION)
bot.on(Events.InteractionCreate, async (interaction) => {

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
        const embed = new EmbedBuilder()
            .setTitle("Erreur")
            .setColor("#FF0000")
            .setDescription("Seg fault")
            .setFooter({ text : "Contacter Angelo pour qui resout le soucis"});
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds : [embed], ephemeral: true });
		} else {
			await interaction.reply({ embeds : [embed], ephemeral: true });
		}
	}
})

bot.login(process.env.TOKEN);
