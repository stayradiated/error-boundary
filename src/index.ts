import {
  BetterError,
  BetterErrorConstructorArg,
} from '@northscaler/better-error'

type MultiErrorConstructorArg = BetterErrorConstructorArg & {
  cause: Error[]
}

// eslint-disable-next-line fp/no-class
class MultiError extends BetterError {
  override cause: Error[]

  constructor(arg: MultiErrorConstructorArg) {
    super(arg)
    // eslint-disable-next-line fp/no-this
    this.cause = arg.cause
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

function listOrError<T>(list: Array<T | Error>): T[] | MultiError {
  const errors = list.filter((item) => item instanceof Error) as Error[]
  if (errors.length > 0) {
    return new MultiError({
      message: `Caught ${errors.length} error${errors.length === 1 ? '' : 's'}`,
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
  <T>(value: T | Error): Exclude<T, Error>
  <T>(value: Promise<T | Error>): Promise<Exclude<T, Error>>
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

type ThrowIfValueFn = {
  <T>(
    value: T extends Promise<unknown> ? never : T | Error,
    message?: string,
  ): Error
  <T>(value: Promise<T | Error>, message?: string): Promise<Error>
}

const throwIfValue: ThrowIfValueFn = (
  value,
  message = 'Expected value to be an error.',
) => {
  if (value instanceof Error) {
    return value
  }

  if (value instanceof Promise) {
    return value.then(
      (resolvedValue) => {
        if (resolvedValue instanceof Error) {
          return resolvedValue
        }

        // eslint-disable-next-line fp/no-throw
        throw new Error(message)
      },
      (error) => {
        return asError(error)
      },
    )
  }

  // eslint-disable-next-line fp/no-throw
  throw new Error(message)
}

export {
  errorBoundary,
  errorListBoundary,
  throwIfError,
  throwIfValue,
  MultiError,
}
