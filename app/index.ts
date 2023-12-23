import { Client, Events } from "discord.js";
import { registerCommands } from "./commands/commands";
import { createCommands } from "./commands/register";
import { createConfig } from "./config/config";
import { createLogger } from "./logger";

const config = createConfig();
const logger = createLogger({ loggingConfig: config.logger });

const discordClient = new Client({
	intents: config.discord.intents,
});

discordClient.on(Events.ClientReady, async (data) => {
	logger.info(`Logged in as ${data.user.tag}!`);

	process.on("SIGTERM", () => {
		logger.info("SIGTERM received");
		process.exit(0);
	});
	process.on("SIGINT", () => {
		logger.info("SIGINT received");
		process.exit(0);
	});
});

registerCommands({ client: discordClient, logger });

createCommands({ discord: config.discord, logger }).then((result) => {
	if (!result.success) {
		return;
	}
	discordClient.login(config.discord.token);
});
