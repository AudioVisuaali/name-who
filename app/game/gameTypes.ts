import { User } from "discord.js";

export type GameOption = {
	postUrl: string;
	url: string;
	answer: string;
	owner: string;
};

export type GameScoreboardPlayer = {
	user: User;
	score: number;
};
export type GameScoreboard = Record<string, GameScoreboardPlayer>;
