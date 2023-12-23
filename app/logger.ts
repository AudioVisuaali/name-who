import pino, { LevelWithSilent, Logger as LoggerPino } from "pino";
import { LoggingConfig } from "./config/logging/loggingConfig";

export type Logger = LoggerPino & {
	__never: "logger";
};
export type LoggingLevel = LevelWithSilent;
export const loggingLevelValues: LoggingLevel[] = [
	"fatal",
	"error",
	"warn",
	"info",
	"debug",
	"trace",
	"silent",
];

export type CreateLoggerParams = {
	loggingConfig: LoggingConfig;
};

export const createLogger = (params: CreateLoggerParams): Logger => {
	const stream = params.loggingConfig.pretty
		? require("pino-pretty")()
		: undefined;

	return pino({ level: params.loggingConfig.level }, stream) as Logger;
};
