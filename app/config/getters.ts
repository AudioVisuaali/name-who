const printError = (message: string): void => {
	const error = new Error(
		`${message}\n\nFix invalid environment variable and restart the application\n`,
	);
	console.error(error);
};

export const getEnv = <T extends string>(
	envKey: string,
	allowedValues?: T[],
): T => {
	const value = process.env[envKey];

	if (allowedValues) {
		if (allowedValues.includes((value ?? "") as T)) {
			return (value ?? "") as T;
		}
	}

	if (value) {
		return value as T;
	}

	if (allowedValues) {
		printError(
			`Environment variable ${envKey} is not set, accepted values: ${allowedValues
				.map((value) => `"${value}"`)
				.join(", ")}`,
		);
		process.exit(1);
	}

	printError(`Environment variable ${envKey} is not set`);
	process.exit(1);
};

export const getEnvInt = (envKey: string): number => {
	const value = getEnv(envKey);

	const integerRegex = /^\d+$/;

	if (!integerRegex.test(value)) {
		printError(
			`Environment variable ${envKey}. Received invalid value for INT: ${value}`,
		);
		process.exit(1);
	}

	return parseInt(value, 10);
};

export const getEnvBool = (envKey: string): boolean => {
	const value = getEnv(envKey);

	if (value === "TRUE") {
		return true;
	}

	if (value === "FALSE") {
		return false;
	}

	printError(
		`Environment variable ${envKey}. Accepted values: 'TRUE' or 'FALSE' Received invalid value for BOOLEAN: ${value}`,
	);
	process.exit(1);
};
