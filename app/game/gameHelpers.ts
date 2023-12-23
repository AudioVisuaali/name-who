import { GameScoreboardPlayer } from "./gameTypes";

const renderPositionPrefix = (index: number) => {
	if (index === 0) {
		return "🥇";
	}

	if (index === 1) {
		return "🥈";
	}

	if (index === 2) {
		return "🥉";
	}

	return `${index + 1}.`;
};

export const renderPosition = (
	player: GameScoreboardPlayer,
	index: number,
) => ({
	name: `${renderPositionPrefix(index)} ${player.user.displayName}`,
	value: `${player.score} points`,
	inline: true,
});
