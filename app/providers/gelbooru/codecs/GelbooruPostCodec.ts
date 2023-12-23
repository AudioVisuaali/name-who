import * as C from "io-ts/Codec";
import { GelbooruTagNameCodec } from "./GelbooruTagNameCodec";

export const GelbooruPostCodec = C.struct({
	id: C.number,
	tags: GelbooruTagNameCodec,
	file_url: C.string,
	preview_url: C.string,
	sample_url: C.string,
	sample_height: C.number,
	sample_width: C.number,
	rating: C.string,
	owner: C.string,
	creator_id: C.number,
});

export type GelbooruPostEncoded = C.OutputOf<typeof GelbooruPostCodec>;
export type GelbooruPostDecoded = C.TypeOf<typeof GelbooruPostCodec>;
