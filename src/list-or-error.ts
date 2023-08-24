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

export { listOrError }
