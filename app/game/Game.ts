import { EmbedBuilder, Message, TextChannel, User } from "discord.js";
import { DateTime } from "luxon";
import { discordTagTimer } from "../helpers/discordTag";
import { sleepUntill } from "../helpers/sleep";
import { GameAnswer } from "./GameAnswer";
import { renderPosition } from "./gameHelpers";
import { GameOption, GameScoreboard } from "./gameTypes";

type AddPointToUserParams = {
	user: User | null;
};

type SendMessageStartParams = {
	startsAt: DateTime;
};

type GameDurations = {
	scoreBoardDurationSeconds: number;
	roundDurationSeconds: number;
};

type UpdateMessageWithOriginParams = {
	option: GameOption;
	message: Message;
};

type SendMessageQuestionParams = {
	option: GameOption;
	endsAt: DateTime;
};

type WaitFoTimeoutOrCorrectAnswerParams = {
	option: GameOption;
	waitUntill: DateTime;
};

type GameParams = {
	options: GameOption[];
	channel: TextChannel;
	durations: GameDurations;
};

export class Game {
	private gameRoundIndex: number;
	private gameOptions: GameOption[];
	public gameChannel: TextChannel;
	private gameScoreboard: GameScoreboard;
	private durations: GameDurations;

	constructor(params: GameParams) {
		this.gameRoundIndex = 0;
		this.gameOptions = params.options;
		this.gameChannel = params.channel;
		this.durations = params.durations;
		this.gameScoreboard = {};
	}

	private addPointToUser = (params: AddPointToUserParams) => {
		if (!params.user) {
			return;
		}

		if (params.user.bot) {
			return;
		}

		if (params.user.id in this.gameScoreboard) {
			this.gameScoreboard[params.user.id].score += 1;
			return;
		}

		this.gameScoreboard[params.user.id] = {
			user: params.user,
			score: 1,
		};
	};

	private sendMessageScoreboard = async (params: {
		roundWinner?: User | null;
		nextRoundStartsAt: DateTime | null;
	}): Promise<Message> => {
		const placements = Object.values(this.gameScoreboard);
		const sortedPlacements = placements.sort((a, b) => b.score - a.score);

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("📈 Scoreboard")
			.addFields(sortedPlacements.map(renderPosition))
			.setFooter({
				text: `Round ${this.gameRoundIndex + 1} / ${this.gameOptions.length}`,
			});

		if (params.nextRoundStartsAt) {
			embed.setDescription(
				`Next round starts in ${discordTagTimer(params.nextRoundStartsAt)}`,
			);
		}

		return await this.gameChannel.send({ embeds: [embed] });
	};

	private sendMessageQuestion = async (
		params: SendMessageQuestionParams,
	): Promise<Message> => {
		const title = `Round ${this.gameRoundIndex + 1} / ${
			this.gameOptions.length
		}`;
		const description = `Round ends ${discordTagTimer(params.endsAt)}`;

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(title)
			.setDescription(description)
			.setImage(params.option.url);

		return await this.gameChannel.send({ embeds: [embed] });
	};

	private updateMessageWithOrigin = async (
		params: UpdateMessageWithOriginParams,
	) => {
		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle("Original post")
			.setURL(params.option.postUrl)
			.addFields({
				name: `Round ${this.gameRoundIndex + 1}`,
				value: `Right answer: ${params.option.answer}`,
				inline: true,
			})
			.setImage(params.option.url);

		await params.message.edit({ embeds: [embed] });
	};

	private waitForTimeoutOrCorrectAnswer = (
		params: WaitFoTimeoutOrCorrectAnswerParams,
	) =>
		new Promise<Message | null>(
			(resolve) =>
				new GameAnswer({
					client: this.gameChannel.client,
					channel: this.gameChannel,
					compare: (value) =>
						value.toLowerCase() === params.option.answer.toLowerCase(),
					onMatch: resolve,
					waitUntill: params.waitUntill,
				}),
		);

	private runGameStart = async (
		params: SendMessageStartParams,
	): Promise<void> => {
		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle(`Round ${this.gameRoundIndex + 1}`)
			.setDescription(`Game is starting ${discordTagTimer(params.startsAt)}`)
			.addFields([
				{
					name: "Join any time!",
					value: "Participate by typing the name of the character in chat",
					inline: false,
				},
				{
					name: "Answer by typing the characters name in the chat",
					value:
						"Capitalization does not matter, exact spelling matters. Valid answers only accept letters and/or numbers.",
					inline: false,
				},
			]);

		const message = await this.gameChannel.send({ embeds: [embed] });
		await sleepUntill(params.startsAt);
		await message.delete();

		await this.runRoundStart();
	};

	private runRoundStart = async () => {
		const option = this.gameOptions[this.gameRoundIndex];
		if (!option) {
			throw new Error("Game option not found");
		}
		const roundEndsAt = DateTime.now().plus({
			seconds: this.durations.roundDurationSeconds,
		});
		const questionMessage = await this.sendMessageQuestion({
			option,
			endsAt: roundEndsAt,
		});
		const roundWinnerMsg = await this.waitForTimeoutOrCorrectAnswer({
			option,
			waitUntill: roundEndsAt,
		});
		this.addPointToUser({
			user: roundWinnerMsg ? roundWinnerMsg.author : null,
		});
		if (roundWinnerMsg) {
			await roundWinnerMsg.react("🎊");
		}

		await this.updateMessageWithOrigin({ option, message: questionMessage });
		if (this.gameRoundIndex + 1 >= this.gameOptions.length) {
			await this.sendMessageScoreboard({ nextRoundStartsAt: null });
			return;
		}

		await this.runRoundEnd(roundWinnerMsg ? roundWinnerMsg.author : null);
	};

	private runRoundEnd = async (winner: User | null) => {
		const nextRoundStartsAt = DateTime.now().plus({
			seconds: this.durations.scoreBoardDurationSeconds,
		});
		const messagePostRound = await this.sendMessageScoreboard({
			roundWinner: winner,
			nextRoundStartsAt,
		});
		await sleepUntill(nextRoundStartsAt);
		await messagePostRound.delete();

		this.gameRoundIndex += 1;
		this.runRoundStart();
	};

	public async start() {
		const startsAt = DateTime.now().plus({ seconds: 10 });
		await this.runGameStart({ startsAt });
	}
}
