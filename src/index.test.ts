import test from 'ava'

import {
  errorBoundary,
  errorBoundarySync,
  errorListBoundary,
  errorListBoundarySync,
  throwIfError,
  throwIfErrorSync,
  throwIfValue,
  throwIfValueSync,
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

test('throwIfErrorSync: should throw for error values', (t) => {
  t.throws(
    () => {
      throwIfErrorSync(new Error('fail'))
    },
    {
      message: 'fail',
    },
  )
})

test('throwIfError: should throw for async error values', async (t) => {
  await t.throwsAsync(throwIfError(Promise.reject(new Error('fail'))), {
    message: 'fail',
  })
})

test('throwIfErrorSync: should return for non-error values', (t) => {
  const value = {}
  t.is(throwIfErrorSync(value), value)
})

test('throwIfError: should return for non-error async values', async (t) => {
  const value = {}
  const resolvedValue = await throwIfError(Promise.resolve(value))
  t.is(resolvedValue, value)
})

test('throwIfValueSync: should throw for error values', (t) => {
  const error = throwIfValueSync(new Error('success'))
  t.is(error.message, 'success')
})

test('throwIfValue: should return for async error values', async (t) => {
  const error = await throwIfValue(Promise.reject(new Error('success')))
  t.is(error.message, 'success')
})

test('throwIfValueSync: should throw for sync values', (t) => {
  const value = {}
  t.throws(
    () => {
      throwIfValueSync(value, 'should be an error')
    },
    {
      message: 'should be an error',
    },
  )
})

test('throwIfValue: should throw for async values', async (t) => {
  const value = Promise.resolve({})
  await t.throwsAsync(throwIfValue(value, 'should be an error'), {
    message: 'should be an error',
  })
})
