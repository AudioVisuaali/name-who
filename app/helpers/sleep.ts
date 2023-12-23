import { DateTime } from "luxon";

export const sleep = (seconds: number) =>
	new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const sleepUntill = (date: DateTime) =>
	new Promise((resolve) => setTimeout(resolve, date.diffNow().milliseconds));
