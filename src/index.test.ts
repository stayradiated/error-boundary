/* eslint-disable fp/no-throw */

import test from 'ava'

import { errorBoundary, throwIfError } from './index.js'

test('errorBoundary: should catch sync error', (t) => {
  const value = errorBoundary(() => {
    throw new Error('hello world')
  })
  t.true(value instanceof Error)
})

test('errorBoundary: should return sync value', (t) => {
  const value = errorBoundary(() => 'value')
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

test('throwIfError: should throw for error values', (t) => {
  t.throws(
    () => {
      throwIfError(new Error('fail'))
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

test('throwIfError: should return for non-error values', (t) => {
  const value = {}
  t.is(throwIfError(value), value)
})

test('throwIfError: should return for non-error async values', async (t) => {
  const value = {}
  const resolvedValue = await throwIfError(Promise.resolve(value))
  t.is(resolvedValue, value)
})
