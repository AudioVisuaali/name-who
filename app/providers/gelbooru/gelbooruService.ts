import { CommandNameWhoRatingValue } from "../../commands/nameWho/nameWhoParams";
import { GameOption } from "../../game/gameTypes";
import { chunkify } from "../../helpers/chunk";
import { Try, toFailure, toSuccess } from "../../helpers/validation";
import { GelbooruPostDecoded } from "./codecs/GelbooruPostCodec";
import { GelbooruRating } from "./codecs/GelbooruRatingCodec";
import { GelbooruTagDecoded } from "./codecs/GelbooruTagCodec";
import { gelbooruQueries } from "./gelbooruQueries";

const mapRating = (rating: CommandNameWhoRatingValue) => {
	switch (rating) {
		case CommandNameWhoRatingValue.OnlySFW:
			return [
				GelbooruRating.QUESTIONABLE,
				GelbooruRating.SENSITIVE,
				GelbooruRating.EXPLICIT,
			];

		case CommandNameWhoRatingValue.OnlyNSFW:
			return [
				GelbooruRating.GENERAL,
				GelbooruRating.QUESTIONABLE,
				GelbooruRating.SENSITIVE,
			];

		case CommandNameWhoRatingValue.OnlyQuestionable:
			return [GelbooruRating.GENERAL, GelbooruRating.EXPLICIT];

		case CommandNameWhoRatingValue.UpToNSFW:
			return [];

		case CommandNameWhoRatingValue.UpToQuestionable:
			return [
				GelbooruRating.SENSITIVE,
				GelbooruRating.GENERAL,
				GelbooruRating.EXPLICIT,
			];
	}
};

const tagFilterRegex = /^[a-z0-9_()]+$/;
const filterTag = (tag: string) => tagFilterRegex.test(tag);
const selectOnlyChildTagRegex = /^([a-z0-9]+)(_\([a-z0-9_]+\))*$/;
const removeParentFromTag = (tag: string): Try<string, Error> => {
	const match = tag.match(selectOnlyChildTagRegex);
	if (!match) {
		return toFailure(new Error(`Could not parse tag: ${tag}`));
	}

	return toSuccess(match[1].replace(/_/g, " "));
};

type GetPostsUntillThresholdWithFilterOptimizedParams = {
	targetCount: number;
	tags: string[];
	rating: CommandNameWhoRatingValue;
};

type Combined = {
	answer: string;
	post: GelbooruPostDecoded;
};

export const gelbooruService = {
	getPostsUntillThresholdWithFilterOptimized: async (
		params: GetPostsUntillThresholdWithFilterOptimizedParams,
	): Promise<Try<GameOption[], Error>> => {
		const tagsCache: Record<string, GelbooruTagDecoded> = {};
		const posts: Combined[] = [];

		let pageIndex = 0;
		let noFurtherPosts = false;
		while (!noFurtherPosts && posts.length < params.targetCount) {
			console.log(`@page ${pageIndex + 1}`);
			console.log(`@posts.total ${posts.length}`);
			const resultPosts = await gelbooruQueries.getPosts({
				pageIndex,
				removeRatings: mapRating(params.rating),
				orTags: ["1girl", "1boy"],
				requiredTags: params.tags,
			});
			if (!resultPosts.success) {
				return toFailure(resultPosts.failure);
			}
			if (resultPosts.value.length === 0) {
				noFurtherPosts = true;
				continue;
			}

			pageIndex += 1;

			const missingTags: string[] = [];
			for (const post of resultPosts.value) {
				const postTags = post.tags.filter(filterTag);
				if (posts.length >= params.targetCount) {
					continue;
				}

				for (const tag of postTags) {
					if (tag in tagsCache) {
						continue;
					}

					missingTags.push(tag);
				}
			}

			const tagChunks = chunkify(missingTags, 100);
			for (let i = 0; i < tagChunks.length; i++) {
				console.log(`@tags ${i + 1}/${tagChunks.length}`);
				const result = await gelbooruQueries.getTags({
					names: tagChunks[i],
				});

				if (!result.success) {
					return toFailure(result.failure);
				}

				for (const newTag of result.value) {
					tagsCache[newTag.name] = newTag;
				}
			}

			for (const post of resultPosts.value) {
				const postTags = post.tags.filter(filterTag);
				const relatedTags = [];
				for (const postTagString of postTags) {
					const postTag = tagsCache[postTagString];
					if (postTag.type !== 4) {
						continue;
					}

					relatedTags.push(postTag);
				}

				if (relatedTags.length !== 1) {
					continue;
				}
				const [relatedTag] = relatedTags;

				const tagValidated = removeParentFromTag(relatedTag.name);
				if (!tagValidated.success) {
					continue;
				}

				if (posts.length === 0) {
					posts.push({
						answer: tagValidated.value,
						post,
					});
					continue;
				}
				const lastPost = posts[posts.length - 1];
				if (
					lastPost.post.owner === post.owner &&
					lastPost.answer === tagValidated.value
				) {
					continue;
				}

				posts.push({
					answer: tagValidated.value,
					post,
				});
			}
		}

		return toSuccess(
			posts.map((post) => ({
				answer: post.answer,
				owner: post.post.owner,
				url: post.post.file_url,
				postUrl: `https://gelbooru.com/index.php?page=post&s=view&id=${post.post.id}`,
			})),
		);
	},
};
