import { createDiscordConfig } from "./discord/discordConfig";
import { createLoggingConfig } from "./logging/loggingConfig";

export const createConfig = () => ({
	discord: createDiscordConfig(),
	logger: createLoggingConfig(),
});
