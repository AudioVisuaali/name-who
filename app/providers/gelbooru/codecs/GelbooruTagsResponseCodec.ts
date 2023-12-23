import * as C from "io-ts/Codec";
import { GelbooruTagCodec } from "./GelbooruTagCodec";

export const GelbooruTagsResponseCodec = C.struct({
	"@attributes": C.struct({
		count: C.number,
		offset: C.number,
	}),
	tag: C.array(GelbooruTagCodec),
});

export type GelbooruPostsResponseEncoded = C.OutputOf<
	typeof GelbooruTagsResponseCodec
>;
export type GelbooruPostsResponseDecoded = C.TypeOf<
	typeof GelbooruTagsResponseCodec
>;
