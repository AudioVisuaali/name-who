import { getEnv, getEnvBool } from "../getters";

export enum LoggingLevel {
	trace = "trace",
	debug = "debug",
	info = "info",
	warn = "warn",
	error = "error",
	fatal = "fatal",
}

const acceptedValues = Object.values(LoggingLevel);

export type LoggingConfig = {
	name: string;
	level: LoggingLevel;
	pretty: boolean;
};

export const createLoggingConfig = (): LoggingConfig => ({
	name: "name-who",
	level: getEnv("LOGGING_LEVEL", acceptedValues),
	pretty: getEnvBool("LOGGING_PRETTY"),
});
