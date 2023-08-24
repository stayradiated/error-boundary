import { asError } from './as-error.js'

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

export { errorBoundary, errorBoundarySync }
