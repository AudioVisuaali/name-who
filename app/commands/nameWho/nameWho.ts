import { CommandFunction } from "../../commands/commands";
import { gameService } from "../../game/gameService";
import { gelbooruService } from "../../providers/gelbooru/gelbooruService";
import {
	commandNameWhoIntermissionDuration,
	commandNameWhoRating,
	commandNameWhoRoundDuration,
	commandNameWhoRounds,
	commandNameWhoTags,
} from "./nameWhoParams";

export const commandNameWho: CommandFunction = async ({
	interaction,
	logger,
}) => {
	const ratingParam = interaction.options.getString(commandNameWhoRating.name);
	const roundsParam = interaction.options.getInteger(commandNameWhoRounds.name);
	const tagsParam = interaction.options.getString(commandNameWhoTags.name);
	const roundDurationParam = interaction.options.getInteger(
		commandNameWhoRoundDuration.name,
	);
	const intermissionParam = interaction.options.getInteger(
		commandNameWhoIntermissionDuration.name,
	);

	const rating = commandNameWhoRating.validate(ratingParam);
	if (!rating.success) {
		return;
	}

	const rounds = commandNameWhoRounds.validate(roundsParam);
	if (!rounds.success) {
		return;
	}

	const tags = commandNameWhoTags.validate(tagsParam);
	if (!tags.success) {
		await interaction.reply(
			"Invalid value in tags parameter. Example: league_of_legends,overwatch",
		);
		return;
	}
	const roundDuration =
		commandNameWhoRoundDuration.validate(roundDurationParam);
	if (!roundDuration.success) {
		return;
	}
	const intermission =
		commandNameWhoIntermissionDuration.validate(intermissionParam);
	if (!intermission.success) {
		return;
	}

	const result = await gameService.startGame({
		targetRounds: rounds.value,
		getOptions: () =>
			gelbooruService.getPostsUntillThresholdWithFilterOptimized({
				targetCount: rounds.value,
				tags: tags.value,
				rating: rating.value,
			}),
		roundDuration: roundDuration.value,
		intermissionDuration: intermission.value,
		interaction,
	});

	if (!result.success) {
		logger.error(result.failure.error, result.failure.type);
	}
};
