import { asError } from './as-error.js'

type ErrorBoundarySyncFunction<T> = () => T | Error
type ErrorBoundaryAsyncFunction<T> = () => Promise<T | Error>

const errorBoundarySync = <T>(
  function_: ErrorBoundarySyncFunction<T>,
): T | Error => {
  try {
    return function_()
  } catch (error: unknown) {
    return asError(error)
  }
}

const errorBoundary = async <T>(
  function_: ErrorBoundaryAsyncFunction<T>,
): Promise<T | Error> => {
  try {
    return await function_().catch(asError)
  } catch (error: unknown) {
    return asError(error)
  }
}

export { errorBoundary, errorBoundarySync }
