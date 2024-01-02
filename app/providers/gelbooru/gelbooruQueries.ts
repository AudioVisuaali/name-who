import axios, { AxiosError } from "axios";
import { errorFromDecodeError } from "../../helpers/decode";
import { Try, toFailure, toSuccess } from "../../helpers/validation";
import { GelbooruPostDecoded } from "./codecs/GelbooruPostCodec";
import { GelbooruPostsResponseCodec } from "./codecs/GelbooruPostResponseCodec";
import { GelbooruRating } from "./codecs/GelbooruRatingCodec";
import { GelbooruTagDecoded } from "./codecs/GelbooruTagCodec";
import { GelbooruTagsResponseCodec } from "./codecs/GelbooruTagsResponseCodec";

const booruClientBase = axios.create({
	baseURL: "https://gelbooru.com/index.php",
	params: {
		json: "1",
		page: "dapi",
		q: "index",
	},
});

import rateLimit from "axios-rate-limit";

// sets max 2 requests per 1 second, other will be delayed
// note maxRPS is a shorthand for perMilliseconds: 1000, and it takes precedence
// if specified both with maxRequests and perMilliseconds
const booruClient = rateLimit(booruClientBase, {
	maxRequests: 1,
	perMilliseconds: 100,
	maxRPS: 1,
});

type GelbooruFilters = {
	requiredTags: string[];
	orTags: string[];
	removeRatings: GelbooruRating[];
};

const createFilterTags = (params: GelbooruFilters) => {
	const tagsParts = [
		...params.requiredTags,
		...params.removeRatings.map((r) => `-rating:${r}`),
	];
	if (params.orTags.length === 1) {
		tagsParts.push(params.orTags[0]);
	}
	if (params.orTags.length > 1) {
		tagsParts.push(`{${params.orTags.join(" ~ ")}}`);
	}

	return tagsParts;
};

type GetCountParams = {
	requiredTags: string[];
	orTags: string[];
	removeRatings: GelbooruRating[];
};

type GetPostsParams = {
	pagination: {
		limit: number;
		pageIndex: number;
	};
	filters: GelbooruFilters;
};

export type GelbooruPagination = {
	count: number;
};

type GetTagsParams = {
	names: string[];
};

export const gelbooruQueries = {
	getPosts: async (
		params: GetPostsParams,
	): Promise<Try<GelbooruPostDecoded[], Error>> => {
		const tagsParts = createFilterTags(params.filters);

		try {
			const response = await booruClient.get("", {
				params: {
					s: "post",
					tags: tagsParts.join(" "),
					pid: params.pagination.pageIndex,
					limit: params.pagination.limit ?? 15,
				},
			});

			const result = GelbooruPostsResponseCodec.decode(response.data);

			if (result._tag !== "Right") {
				return toFailure(errorFromDecodeError(result));
			}

			return toSuccess(result.right.post ?? []);
		} catch (error) {
			return toFailure(error as AxiosError);
		}
	},

	getCount: async (params: GetCountParams): Promise<Try<number, Error>> => {
		const tagsParts = createFilterTags(params);

		try {
			const response = await booruClient.get("", {
				params: {
					s: "post",
					tags: tagsParts.join(" "),
					pid: 0,
					limit: 1,
				},
			});

			const result = GelbooruPostsResponseCodec.decode(response.data);

			if (result._tag !== "Right") {
				return toFailure(errorFromDecodeError(result));
			}

			return toSuccess(result.right["@attributes"].count);
		} catch (error) {
			return toFailure(error as AxiosError);
		}
	},

	getTags: async (
		params: GetTagsParams,
	): Promise<Try<GelbooruTagDecoded[], Error>> => {
		try {
			const response = await booruClient.get("", {
				params: {
					s: "tag",
					names: params.names.join(" "),
				},
			});

			const result = GelbooruTagsResponseCodec.decode(response.data);

			if (result._tag !== "Right") {
				return toFailure(errorFromDecodeError(result));
			}

			return toSuccess(result.right.tag);
		} catch (error) {
			return toFailure(error as AxiosError);
		}
	},
};
