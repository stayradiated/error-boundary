function assertError<T>(
  value: T | Error,
  message = 'Expected value to be an error.',
): asserts value is Error {
  if (!(value instanceof Error)) {
    throw new TypeError(message)
  }
}

function assertOk<T>(
  value: T | Error,
): asserts value is T extends Error ? never : T {
  if (value instanceof Error) {
    throw value
  }
}

export { assertError, assertOk }
