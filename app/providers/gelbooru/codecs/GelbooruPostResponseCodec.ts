import * as C from "io-ts/Codec";
import { GelbooruPostCodec } from "./GelbooruPostCodec";

const GelbooruPostsResponseCodecRequired = C.struct({
	"@attributes": C.struct({
		count: C.number,
		offset: C.number,
	}),
});
const GelbooruPostsResponseCodecPartial = C.partial({
	post: C.array(GelbooruPostCodec),
});
export const GelbooruPostsResponseCodec = C.intersect(
	GelbooruPostsResponseCodecRequired,
)(GelbooruPostsResponseCodecPartial);

export type GelbooruPostsResponseEncoded = C.OutputOf<
	typeof GelbooruPostsResponseCodec
>;
export type GelbooruPostsResponseDecoded = C.TypeOf<
	typeof GelbooruPostsResponseCodec
>;
