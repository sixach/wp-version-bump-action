import {validVersion} from '../src/utils'

describe('validVersion()', () => {
  it.each([
    ['x', null],
    ['v1', null],
    ['3', null],
    ['2.5', null],
    ['2.5.1', '2.5.1'],
    ['2.5.1+3', '2.5.1'],
    ['15.0.0+14', '15.0.0'],
    ['15.0.0+14.1.202003190635', '15.0.0']
  ])('%s -> %s', (inputVersion: string, expected: string | null) => {
    const actual = validVersion(inputVersion)
    expect(actual).toBe(expected)
  })
})
