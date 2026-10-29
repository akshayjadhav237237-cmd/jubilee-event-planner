export type Ok<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Err<E> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

/** Wraps a value in a successful Result. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Wraps an error in an unsuccessful Result. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Type guard checking if a Result is Ok. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}
