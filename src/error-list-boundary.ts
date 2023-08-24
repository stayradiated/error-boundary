import { listOrError } from './list-or-error.js'
import { asError } from './as-error.js'

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

export { errorListBoundary, errorListBoundarySync }
