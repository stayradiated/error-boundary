import { listOrError } from './list-or-error.js'
import { asError } from './as-error.js'

type ErrorListBoundaryAsyncFunction<T> = () => Promise<Array<T | Error>>
type ErrorListBoundarySyncFunction<T> = () => Array<T | Error>

const errorListBoundarySync = <T>(
  function_: ErrorListBoundarySyncFunction<T>,
): T[] | Error => {
  try {
    const list = function_()
    return listOrError(list)
  } catch (error: unknown) {
    return asError(error)
  }
}

const errorListBoundary = async <T>(
  function_: ErrorListBoundaryAsyncFunction<T>,
): Promise<T[] | Error> => {
  try {
    return await function_().then(listOrError, asError)
  } catch (error: unknown) {
    return asError(error)
  }
}

export { errorListBoundary, errorListBoundarySync }
