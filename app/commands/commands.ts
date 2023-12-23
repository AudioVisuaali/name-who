import { ChatInputCommandInteraction, Client, Events } from "discord.js";
import { Logger } from "../logger";
import { commandNameWho } from "./nameWho/nameWho";
import { commandNameWhoProperties } from "./nameWho/nameWhoParams";

type CommandFunctionParams = {
	logger: Logger;
	interaction: ChatInputCommandInteraction;
};

export type CommandFunction = (params: CommandFunctionParams) => Promise<void>;

export const commands: Record<string, CommandFunction> = {
	[commandNameWhoProperties.name]: commandNameWho,
};

type RegisterCommandsParams = {
	client: Client<boolean>;
	logger: Logger;
};
export const registerCommands = ({
	client,
	logger,
}: RegisterCommandsParams) => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		logger.info({ value: interaction.commandName }, "Command received");

		const command = commands[interaction.commandName];
		if (!command) {
			logger.info({ value: interaction.commandName }, "Command not found");
			await interaction.reply({
				content: "Command not supported anymore",
				ephemeral: true,
			});
			return;
		}

		await command({ interaction, logger });
	});
};
