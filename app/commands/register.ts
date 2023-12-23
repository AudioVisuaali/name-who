import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { DiscordConfig } from "../config/discord/discordConfig";
import { Try, toFailure, toSuccess } from "../helpers/validation";
import { Logger } from "../logger";
import {
	commandNameWhoIntermissionDuration,
	commandNameWhoProperties,
	commandNameWhoProvider,
	commandNameWhoRating,
	commandNameWhoRoundDuration,
	commandNameWhoRounds,
	commandNameWhoTags,
} from "./nameWho/nameWhoParams";

const command = new SlashCommandBuilder()
	.setName(commandNameWhoProperties.name)
	.setDescription(commandNameWhoProperties.description)
	.addIntegerOption((option) =>
		option
			.setName(commandNameWhoRounds.name)
			.setDescription(commandNameWhoRounds.description)
			.setMaxValue(commandNameWhoRounds.value.max)
			.setMinValue(commandNameWhoRounds.value.min)
			.setRequired(commandNameWhoRounds.required),
	)
	.addStringOption((option) =>
		option
			.setName(commandNameWhoRating.name)
			.setDescription(commandNameWhoRating.description)
			.addChoices(...commandNameWhoRating.choices)
			.setRequired(commandNameWhoRating.required),
	)
	.addStringOption((option) =>
		option
			.setName(commandNameWhoTags.name)
			.setDescription(commandNameWhoTags.description)
			.setMinLength(2)
			.setRequired(commandNameWhoTags.required),
	)
	.addIntegerOption((option) =>
		option
			.setName(commandNameWhoRoundDuration.name)
			.setDescription(commandNameWhoRoundDuration.description)
			.setMaxValue(commandNameWhoRoundDuration.value.max)
			.setMinValue(commandNameWhoRoundDuration.value.min)
			.setRequired(commandNameWhoRoundDuration.required),
	)
	.addIntegerOption((option) =>
		option
			.setName(commandNameWhoIntermissionDuration.name)
			.setDescription(commandNameWhoIntermissionDuration.description)
			.setMaxValue(commandNameWhoIntermissionDuration.value.max)
			.setMinValue(commandNameWhoIntermissionDuration.value.min)
			.setRequired(commandNameWhoIntermissionDuration.required),
	)
	.addStringOption((option) =>
		option
			.setName(commandNameWhoProvider.name)
			.setDescription(commandNameWhoProvider.description)
			.addChoices(...commandNameWhoProvider.choices)
			.setRequired(commandNameWhoProvider.required),
	);

type CreateCommandsParams = {
	discord: DiscordConfig;
	logger: Logger;
};

export const createCommands = async (
	params: CreateCommandsParams,
): Promise<Try<true, Error>> => {
	const rest = new REST({ version: "10" }).setToken(params.discord.token);

	try {
		params.logger.info("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationCommands(params.discord.clientId), {
			body: [command],
		});
		params.logger.info("Successfully reloaded application (/) commands.");

		return toSuccess(true);
	} catch (error) {
		params.logger.error(error);
		return toFailure(error as Error);
	}
};
