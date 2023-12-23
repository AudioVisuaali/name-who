import { Channel, Client, Message } from "discord.js";
import { DateTime } from "luxon";

type GameAnswerAttachParams = {
	waitUntill: DateTime;
};

type GameAnswerParams = {
	waitUntill: DateTime;
	client: Client<true>;
	channel: Channel;
	compare: (value: string) => boolean;
	onMatch: (message: Message | null) => void;
};

export class GameAnswer {
	private client: Client<true>;
	private channel: Channel;
	private timeout: NodeJS.Timeout | null;
	private onMatch: (message: Message | null) => void;
	private compare: (value: string) => boolean;

	constructor(params: GameAnswerParams) {
		this.client = params.client;
		this.channel = params.channel;
		this.compare = params.compare;
		this.onMatch = params.onMatch;
		this.timeout = null;
		this.attach({ waitUntill: params.waitUntill });
	}

	private attach = (params: GameAnswerAttachParams) => {
		this.timeout = setTimeout(() => {
			this.removeListeners();
			this.onMatch(null);
		}, params.waitUntill.diffNow("milliseconds").milliseconds);

		this.client.on("messageCreate", this.handleMessage);
	};

	private removeListeners = () => {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		this.client.removeListener("messageCreate", this.handleMessage);
	};

	private handleMessage = (message: Message) => {
		if (message.author.bot) {
			return;
		}

		if (message.channel.id !== this.channel.id) {
			return;
		}

		const isMatch = this.compare(message.content);
		if (!isMatch) {
			return;
		}

		this.removeListeners();
		this.onMatch(message);
	};
}
