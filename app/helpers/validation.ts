export type Try<T, F> = Success<T> | Failure<F>;

export type Success<T> = Readonly<{
	value: T;
	success: true;
}>;

export type Failure<F> = Readonly<{
	failure: F;
	success: false;
}>;

export function toSuccess<T>(value: T): Success<T> {
	return {
		success: true,
		value,
	};
}

export function toFailure<F>(failure: F): Failure<F> {
	return {
		failure,
		success: false,
	};
}

export function trySuccess<T, F>(result: Try<T, F>): T {
	if (result.success) {
		return result.value;
	}

	throw result.failure;
}
