import test from 'ava'

import {
  errorBoundary,
  errorBoundarySync,
  errorListBoundary,
  errorListBoundarySync,
  assertOk,
  assertError,
} from './index.js'

test('errorBoundarySync: should catch error', (t) => {
  const value = errorBoundarySync(() => {
    throw new Error('hello world')
  })
  t.true(value instanceof Error)
})

test('errorBoundarySync: should return value', (t) => {
  const value = errorBoundarySync(() => 'value')
  t.is(value, 'value')
})

test('errorBoundary: should catch error', async (t) => {
  const value = await errorBoundary(async () => {
    throw new Error('hello world')
  })
  t.true(value instanceof Error)
})

test('errorBoundary: should return value', async (t) => {
  const value = await errorBoundary(async () => 'value')
  t.is(value, 'value')
})

test('errorListBoundarySync: should return list', (t) => {
  const list = ['a', 'b', 'c']
  const value = errorListBoundarySync(() => list)
  t.is(value, list)
})

test('errorListBoundarySync: should return error', (t) => {
  const list = ['a', new Error('Fail A'), 'b', 'c']
  const value = errorListBoundarySync(() => list)
  t.like(value, {
    message: 'E_MULTI: Caught 1 error: [Fail A]',
  })
})

test('errorListBoundary: should return list', async (t) => {
  const list = ['a', 'b', 'c']
  const value = await errorListBoundary(async () => list)
  t.is(value, list)
})

test('errorListBoundary: should return error', async (t) => {
  const list = ['a', new Error('Fail A'), 'b', 'c', new Error('Fail B')]
  const value = await errorListBoundary(async () => list)
  t.like(value, {
    message: 'E_MULTI: Caught 2 errors: [Fail A, Fail B]',
  })
})

test('errorListBoundary: should return error (Promise.all)', async (t) => {
  const items = [3, 2, 1, -1, -2]
  const value = await errorListBoundary(async () =>
    Promise.all(
      items.map(async (item) => {
        if (item < 0) {
          return new Error(`${item} is not >= 0`)
        }

        return 2 ** item
      }),
    ),
  )
  t.like(value, {
    message: 'E_MULTI: Caught 2 errors: [-1 is not >= 0, -2 is not >= 0]',
  })
})

test('assertOk: should throw for error values', (t) => {
  const eitherStringOrError = errorBoundarySync<string>(() => {
    throw new Error('eitherStringOrError is an Error')
  })

  t.throws(
    () => {
      assertOk(eitherStringOrError)
      t.fail()
    },
    {
      message: 'eitherStringOrError is an Error',
    },
  )
})

test('assertOk: should return for non-error values', (t) => {
  const eitherStringOrError = errorBoundarySync<string>(() => {
    return 'Success'
  })

  assertOk(errorBoundarySync)

  t.is(eitherStringOrError, 'Success')
})

test('assertError: should throw for error values', (t) => {
  const eitherStringOrError = errorBoundarySync<string>(() => {
    return 'Success'
  })

  t.throws(
    () => {
      assertError(eitherStringOrError)
      t.fail()
    },
    {
      message: 'Expected value to be an error.',
    },
  )
})

test('assertError: should throw for sync values', (t) => {
  const eitherStringOrError = errorBoundarySync<string>(() => {
    throw new Error('eitherStringOrError is an Error')
  })

  assertError(eitherStringOrError)

  t.true(eitherStringOrError instanceof Error)
})
