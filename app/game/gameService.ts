import {
	ChannelType,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { Try, toFailure, toSuccess } from "../helpers/validation";
import { Game } from "./Game";
import { GameAlreadyRunning } from "./GameAlreadyRunning";
import { GameOption } from "./gameTypes";

export enum StartGameFailureType {
	OPTIONS_ERROR = "options-error",
	NO_OPTIONS = "no-options",
	ALREADY_RUNNING = "already-running",
	INVALID_CHANNEL_TYPE = "invalid-channel-type",
}

type StartGameFailure = {
	type: StartGameFailureType;
	error: Error;
};

type StartGameParams = {
	interaction: ChatInputCommandInteraction;
	getOptions: () => Promise<Try<GameOption[], Error>>;
	targetRounds: number;
	roundDuration: number;
	intermissionDuration: number;
};

const alreadyRunning = new GameAlreadyRunning();

export const gameService = {
	startGame: async (
		params: StartGameParams,
	): Promise<Try<true, StartGameFailure>> => {
		if (!params.interaction.channel) {
			await params.interaction.reply({
				content: "Invalid channel",
				ephemeral: true,
			});
			return toFailure({
				type: StartGameFailureType.INVALID_CHANNEL_TYPE,
				error: new Error("Invalid channel type"),
			});
		}
		if (params.interaction.channel.type !== ChannelType.GuildText) {
			await params.interaction.reply({
				content: "Invalid channel",
				ephemeral: true,
			});
			return toFailure({
				type: StartGameFailureType.INVALID_CHANNEL_TYPE,
				error: new Error("Invalid channel type"),
			});
		}

		if (alreadyRunning.isRunningChannel(params.interaction.channel)) {
			await params.interaction.reply("You can only run one game per channel");
			return toFailure({
				type: StartGameFailureType.ALREADY_RUNNING,
				error: new Error("Game is already running"),
			});
		}

		await params.interaction.reply({
			content: "Starting game...",
			ephemeral: true,
		});

		const options = await params.getOptions();

		if (!options.success) {
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle("Failed to fetch options")
				.setDescription("Couldn't retrieve posts from the API");
			await params.interaction.channel.send({ embeds: [embed] });
			return toFailure({
				type: StartGameFailureType.NO_OPTIONS,
				error: options.failure,
			});
		}

		if (options.value.length === 0) {
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle("No options")
				.setDescription("No posts found with the given tags");
			await params.interaction.channel.send({ embeds: [embed] });
			return toFailure({
				type: StartGameFailureType.NO_OPTIONS,
				error: new Error("No options"),
			});
		}

		const game = new Game({
			options: options.value,
			channel: params.interaction.channel,
			durations: {
				scoreBoardDurationSeconds: params.intermissionDuration,
				roundDurationSeconds: params.roundDuration,
			},
		});
		await game.start();
		return toSuccess(true);
	},
};
