import { inspect } from 'util'

const errorBoundary = async <T>(
  fn: () => Promise<T | Error>,
): Promise<T | Error> => {
  try {
    const value = await fn()
    return value
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error
    }

    return new Error(inspect(error))
  }
}

const errorBoundarySync = <T>(fn: () => T | Error): T | Error => {
  try {
    return fn()
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error
    }

    return new Error(inspect(error))
  }
}

export { errorBoundary, errorBoundarySync }
