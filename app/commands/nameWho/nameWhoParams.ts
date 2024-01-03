import { Try, toFailure, toSuccess } from "../../helpers/validation";

export const commandNameWhoProperties = {
	name: "namewho",
	description: "Start a new game of NameWho",
};

export enum CommandNameWhoProviderValue {
	GelGooru = "gelbooru",
}
export const commandNameWhoProvider = {
	name: "provider",
	required: false,
	description: "Source of game options",
	choices: [
		{
			name: "Gelbooru",
			value: "gelbooru",
		},
	],
	validate: (input: string | null): Try<string, Error> => {
		if (!input) {
			return toSuccess(commandNameWhoProvider.choices[0].value);
		}

		if (input in CommandNameWhoProviderValue) {
			return toSuccess(input);
		}

		return toFailure(new Error(`Invalid provider: ${input}`));
	},
};

export enum CommandNameWhoRatingValue {
	OnlySFW = "only-sfw",
	OnlyNSFW = "only-nsfw",
	OnlyQuestionable = "only-questionable",

	UpToNSFW = "up-to-nsfw",
	UpToQuestionable = "up-to-questionable",
}
export const commandNameWhoRating = {
	name: "rating",
	required: false,
	default: CommandNameWhoRatingValue.OnlySFW,
	description: "Content safety rating (default: Only SFW)",
	choices: [
		{
			name: "Only SFW (Safe for work)",
			value: CommandNameWhoRatingValue.OnlySFW,
		},
		{
			name: "Only Questionable",
			value: CommandNameWhoRatingValue.OnlyQuestionable,
		},
		{
			name: "Only NSFW (Not safe for work)",
			value: CommandNameWhoRatingValue.OnlyNSFW,
		},
		{
			name: "Up to Questionable",
			value: CommandNameWhoRatingValue.UpToQuestionable,
		},
		{
			name: "Up to NSFW (Not safe for work)",
			value: CommandNameWhoRatingValue.UpToNSFW,
		},
	],
	validate: (input: string | null): Try<CommandNameWhoRatingValue, Error> => {
		if (!input) {
			return toSuccess(commandNameWhoRating.default);
		}

		if (
			Object.values(CommandNameWhoRatingValue).includes(
				input as CommandNameWhoRatingValue,
			)
		) {
			return toSuccess(input as CommandNameWhoRatingValue);
		}

		return toFailure(new Error(`Invalid rating: ${input}`));
	},
};

export const commandNameWhoRounds = {
	name: "rounds",
	description: "Max rounds",
	required: true,
	value: {
		default: 10,
		min: 2,
		max: 20,
	},
	validate: (input: number | null): Try<number, Error> => {
		if (!input) {
			return toSuccess(commandNameWhoRounds.value.default);
		}
		if (input < commandNameWhoRounds.value.min) {
			return toFailure(new Error(`Invalid rounds: ${input}`));
		}

		if (input > commandNameWhoRounds.value.max) {
			return toFailure(new Error(`Invalid rounds: ${input}`));
		}

		return toSuccess(input);
	},
};

export const commandNameWhoTagsRegex = /^[a-z0-9_'"!]+[,[a-z0-9_]+]?$/;
export const commandNameWhoTags = {
	name: "tags",
	required: false,
	description: "Seperate with comma. Example: league_of_legends,valorant",
	validate: (input: string | null): Try<string[], Error> => {
		if (!input) {
			return toSuccess([]);
		}

		if (input === "") {
			return toSuccess([]);
		}

		if (!commandNameWhoTagsRegex.test(input)) {
			return toFailure(new Error(`Invalid tags: ${input}`));
		}

		return toSuccess(input.split(","));
	},
};

export const commandNameWhoRoundDuration = {
	name: "round-duration",
	required: false,
	value: {
		default: 30,
		min: 5,
		max: 120,
	},
	description: "Duration in seconds (default 30s)",
	validate: (input: number | null): Try<number, Error> => {
		if (!input) {
			return toSuccess(commandNameWhoRoundDuration.value.default);
		}

		if (input > commandNameWhoRoundDuration.value.max) {
			return toFailure(new Error(`Invalid round duration: ${input}`));
		}

		if (input < commandNameWhoRoundDuration.value.min) {
			return toFailure(new Error(`Invalid round duration: ${input}`));
		}

		return toSuccess(input);
	},
};

export const commandNameWhoIntermissionDuration = {
	name: "intermission-duration",
	required: false,
	value: {
		default: 10,
		min: 5,
		max: 20,
	},
	description: "Duration between rounds in seconds (default 10s)",
	validate: (input: number | null): Try<number, Error> => {
		if (!input) {
			return toSuccess(commandNameWhoIntermissionDuration.value.default);
		}

		if (input > commandNameWhoIntermissionDuration.value.max) {
			return toFailure(new Error(`Invalid intermission: ${input}`));
		}

		if (input < commandNameWhoIntermissionDuration.value.min) {
			return toFailure(new Error(`Invalid intermission: ${input}`));
		}

		return toSuccess(input);
	},
};
