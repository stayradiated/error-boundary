import { inspect } from 'util'

type ErrorBoundaryFn = {
  <T>(fn: () => T | Error): T | Error
  <T>(fn: () => Promise<T | Error>): Promise<T | Error>
}

const errorBoundary: ErrorBoundaryFn = (fn) => {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.catch((error) => {
        if (error instanceof Error) {
          return error
        }

        return new Error(inspect(error))
      })
    }

    return result
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error
    }

    return new Error(inspect(error))
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

export { errorBoundary, throwIfError }
