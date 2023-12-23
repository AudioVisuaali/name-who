import { pipe } from "fp-ts/function";
import * as C from "io-ts/Codec";
import * as D from "io-ts/Decoder";

import * as E from "io-ts/Encoder";

const decoder: D.Decoder<unknown, string[]> = pipe(
	D.string,
	D.parse((s) => D.success(s.split(" "))),
);

const encoder: E.Encoder<string, string[]> = {
	encode: (a) => a.join(" "),
};

export const GelbooruTagNameCodec: C.Codec<unknown, string, string[]> = C.make(
	decoder,
	encoder,
);
