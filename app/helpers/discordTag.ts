import { User } from "discord.js";
import { DateTime } from "luxon";

export const discordTagTimer = (at: DateTime): string =>
	`<t:${Math.floor(at.toSeconds() + 1)}:R>`;

export const discordTagUser = (user: User) => `<@${user.id}>`;
