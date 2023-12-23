import { GatewayIntentBits } from "discord.js";
import { getEnv } from "../getters";

export type DiscordConfig = {
	token: string;
	clientId: string;
	intents: GatewayIntentBits[];
};

export const createDiscordConfig = (): DiscordConfig => ({
	token: getEnv("DISCORD_TOKEN"),
	clientId: getEnv("DISCORD_CLIENT_ID"),
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});
