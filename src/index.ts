import {
  BetterError,
  BetterErrorConstructorArg,
} from '@northscaler/better-error'

// eslint-disable-next-line fp/no-class
class MultiError extends BetterError {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(arg?: BetterErrorConstructorArg) {
    super(arg)
  }
}

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

function listOrError<T>(list: Array<T | Error>): T[] | Error {
  const errors = list.filter((item) => item instanceof Error) as Error[]
  if (errors.length === 1) {
    return errors[0]!
  }

  if (errors.length > 0) {
    return new MultiError({
      message: `Caught ${errors.length} errors`,
      cause: errors,
    })
  }

  return list as T[]
}

type ErrorBoundarySyncFn<T> = () => T | Error
type ErrorBoundaryAsyncFn<T> = () => Promise<T | Error>

function errorBoundary<T>(fn: ErrorBoundarySyncFn<T>): T | Error
function errorBoundary<T>(fn: ErrorBoundaryAsyncFn<T>): Promise<T | Error>
function errorBoundary<T>(
  fn: ErrorBoundarySyncFn<T> | ErrorBoundaryAsyncFn<T>,
) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.catch(asError)
    }

    return result
  } catch (error: unknown) {
    return asError(error)
  }
}

type ErrorListBoundarySyncFn<T> = () => Array<T | Error>
type ErrorListBoundaryAsyncFn<T> = () => Promise<Array<T | Error>>

function errorListBoundary<T>(fn: ErrorListBoundarySyncFn<T>): T[] | Error
function errorListBoundary<T>(
  fn: ErrorListBoundaryAsyncFn<T>,
): Promise<T[] | Error>
function errorListBoundary<T>(
  fn: ErrorListBoundaryAsyncFn<T> | ErrorListBoundarySyncFn<T>,
) {
  try {
    const list = fn()
    if (list instanceof Promise) {
      return list.then(listOrError, asError)
    }

    return listOrError(list)
  } catch (error: unknown) {
    return asError(error)
  }
}

type ThrowIfErrorFn = {
  <T>(value: T | Error): T
  <T>(value: Promise<T | Error>): Promise<T>
}

const throwIfError: ThrowIfErrorFn = (value) => {
  if (value instanceof Error) {
    // eslint-disable-next-line fp/no-throw
    throw value
  }

  if (value instanceof Promise) {
    return value.then((resolvedValue) => {
      if (resolvedValue instanceof Error) {
        // eslint-disable-next-line fp/no-throw
        throw resolvedValue
      }

      return resolvedValue
    })
  }

  return value
}

export { errorBoundary, errorListBoundary, throwIfError }
