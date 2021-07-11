# @stayradiated/error-boundary

Stop throwing errors, try passing them as values instead.

An Error Boundary guarantees to return any caught exceptions to make it easier
to reason about your code.

Shout out to @brendonjohn for introducing me to this function.

## Installation

```shell
npm install --save @stayradiated/error-boundary
```

## API

- `errorBoundary<T>(fn: () => Promise<T>): Promise<T|Error>`
- `errorBoundary<T>(fn: () => T): T|Error`
- `throwIfError<T>(Promise<T|Error>): Promise<T>`
- `throwIfError<T>(value: T|Error): T`

## Usage

```javascript
const { errorBoundary} = await import('@stayradiated/error-boundary')

const mayThrow = () => {
  if (Math.random() > 0.5) {
    throw new Error('Woah, something broke!')
  } else {
    return 'All good here!'
  }
}

const valueOrError = errorBoundary(() => mayThrow())

if (valueOrError instanceof Error) {
  // explicititly handle error
  console.error(valueOrError)
} else{
  // handle result
  console.log(valueOrError)
}
```

## MIT License

Copyright © 2021 George Czabania

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
