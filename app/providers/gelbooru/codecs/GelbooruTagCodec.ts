import * as C from "io-ts/Codec";

const allowedTypes = [0, 1, 2, 3, 4, 5, 6] as const;
export type GelbooruTagType = (typeof allowedTypes)[number];

export const GelbooruTagCodec = C.struct({
	id: C.number,
	name: C.string,
	count: C.number,
	type: C.literal(...allowedTypes),
});

export type GelbooruTagEncoded = C.OutputOf<typeof GelbooruTagCodec>;
export type GelbooruTagDecoded = C.TypeOf<typeof GelbooruTagCodec>;
