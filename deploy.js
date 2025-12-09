//This file allows to deploy the command slash (for the moment is in test mode)

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('node:fs');
const read = require('fs-readdir-recursive');

const contextFiles = read('./src/Interaction/Context-Menu/').filter(file => file.endsWith('.js'));

const commands = [];
const commandFiles = read('./src/Interaction/Slash').filter(file => file.endsWith('.js'));

//client id is the id of the bot

//Get all Commands Slash
for (const file of commandFiles) {
	const command = require(`./src/Interaction/Slash/${file}`);
	commands.push(command.data.toJSON());
}

//Get all Contexts Menu
for (const file of contextFiles) {
	const context = require(`./src/Interaction/Context-Menu/${file}`);
	commands.push(context.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

//Push all Commands Slash to the Discord API
(async () => {
	try {
		console.log('Started refreshing application commands.');

		await rest.put(
			Routes.applicationCommands(process.env.BOTID),
			{ body: commands },
		);

		console.log('Successfully reloaded application commands.');
	} catch (error) {
		console.error(error);
	}
})();