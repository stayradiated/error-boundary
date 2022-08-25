import type { BetterErrorConstructorArg } from '@northscaler/better-error'
import { BetterError } from '@northscaler/better-error'

type MultiErrorConstructorArg = BetterErrorConstructorArg & {
  cause: Error[]
}

class MultiError extends BetterError {
  override cause: Error[]

  constructor(arg: MultiErrorConstructorArg) {
    super(arg)
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

const throwIfErrorSync = <T>(value: T | Error): Exclude<T, Error> => {
  if (value instanceof Error) {
    throw value
  }

  return value as Exclude<T, Error>
}

const throwIfError = async <T>(
  value: Promise<T | Error>,
): Promise<Exclude<T, Error>> => {
  return value.then((resolvedValue) => {
    if (resolvedValue instanceof Error) {
      throw resolvedValue
    }

    return resolvedValue as Exclude<T, Error>
  })
}

const throwIfValueSync = <T>(
  value: T | Error,
  message = 'Expected value to be an error.',
): Error => {
  if (value instanceof Error) {
    return value
  }

  throw new Error(message)
}

const throwIfValue = async <T>(
  value: Promise<T | Error>,
  message = 'Expected value to be an error.',
): Promise<Error> => {
  return value.then(
    (resolvedValue) => {
      if (resolvedValue instanceof Error) {
        return resolvedValue
      }

      throw new Error(message)
    },
    (error) => {
      return asError(error)
    },
  )
}

export {
  errorBoundary,
  errorBoundarySync,
  errorListBoundary,
  errorListBoundarySync,
  throwIfError,
  throwIfErrorSync,
  throwIfValue,
  throwIfValueSync,
  MultiError,
}
