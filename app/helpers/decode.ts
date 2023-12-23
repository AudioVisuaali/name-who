import { AxiosError } from "axios";
import { Left } from "fp-ts/Either";
import { DecodeError, draw } from "io-ts/Decoder";

export type ErrorResponse = Error | AxiosError;

export const errorFromDecodeError = (left: Left<DecodeError>): Error =>
	new Error(draw(left.left));
