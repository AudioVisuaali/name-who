import { TextChannel } from "discord.js";

export class GameAlreadyRunning {
	private guilds: Record<string, string[]> = {};

	add = (guildId: string, channelId: string) => {
		if (!(guildId in this.guilds)) {
			this.guilds[guildId] = [channelId];

			return;
		}

		this.guilds[guildId].push(channelId);
	};

	remove = (guildId: string, channelId: string) => {
		if (!(guildId in this.guilds)) {
			return;
		}

		const index = this.guilds[guildId].indexOf(channelId);
		if (index === -1) {
			return;
		}

		if (this.guilds[guildId].length === 1) {
			delete this.guilds[guildId];
		}

		this.guilds[guildId].splice(index, 1);
	};

	isRunningGuild = (channel: TextChannel) => {
		return channel.guild.id in this.guilds;
	};

	isRunningChannel = (channel: TextChannel) => {
		if (!(channel.guild.id in this.guilds)) {
			return false;
		}

		const index = this.guilds[channel.guild.id].findIndex(
			(channelIdStored) => channelIdStored === channel.id,
		);

		return index !== -1;
	};
}
