function asError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  try {
    return new Error(`Unexpected error with value: ${JSON.stringify(error)}"`)
  } catch {
    return new Error('Unexpected error with unknown value.')
  }
}

function listOrError<T>(list: Array<T | Error>): T[] | AggregateError {
  const errors = list.filter((item) => item instanceof Error) as Error[]
  if (errors.length > 0) {
    const errorMessageList = errors.map((error) => error.message)
    const message = `E_MULTI: Caught ${errors.length} ${
      errors.length === 1 ? 'error' : 'errors'
    }: [${errorMessageList.join(', ')}]`
    return new AggregateError(errors, message)
  }

  return list as T[]
}

type ErrorBoundarySyncFn<T> = () => T | Error
type ErrorBoundaryAsyncFn<T> = () => Promise<T | Error>

const errorBoundarySync = <T>(fn: ErrorBoundarySyncFn<T>): T | Error => {
  try {
    return fn()
  } catch (error: unknown) {
    return asError(error)
  }
}

const errorBoundary = async <T>(
  fn: ErrorBoundaryAsyncFn<T>,
): Promise<T | Error> => {
  try {
    return await fn().catch(asError)
  } catch (error: unknown) {
    return asError(error)
  }
}

type ErrorListBoundaryAsyncFn<T> = () => Promise<Array<T | Error>>
type ErrorListBoundarySyncFn<T> = () => Array<T | Error>

const errorListBoundarySync = <T>(
  fn: ErrorListBoundarySyncFn<T>,
): T[] | Error => {
  try {
    const list = fn()
    return listOrError(list)
  } catch (error: unknown) {
    return asError(error)
  }
}

const errorListBoundary = async <T>(
  fn: ErrorListBoundaryAsyncFn<T>,
): Promise<T[] | Error> => {
  try {
    return await fn().then(listOrError, asError)
  } catch (error: unknown) {
    return asError(error)
  }
}

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

export {
  errorBoundary,
  errorBoundarySync,
  errorListBoundary,
  errorListBoundarySync,
  listOrError,
  asError,
  assertError,
  assertOk,
}
