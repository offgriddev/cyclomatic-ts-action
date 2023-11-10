import {analyze} from '../analyze'
import {analyzeTypeScript} from '../harvest'
import ts from 'typescript'

jest.mock('../utils', () => ({
  getSourceFile: jest.fn().mockResolvedValue(['file1', 'file2'])
}))

jest.mock('../harvest', () => ({
  analyzeTypeScript: jest.fn(() => [
    {
      source: 'file1',
      metrics: {
        length: 74,
        vocabulary: 43,
        volume: 401.54359184795527,
        difficulty: 4.276315789473684,
        effort: 1717.1272019813875,
        time: 95.39595566563264,
        bugsDelivered: 0.04779844014451811,
        operands: {
          total: 65,
          _unique: {},
          unique: 38
        },
        operators: {
          total: 9,
          _unique: {},
          unique: 5
        },
        complexity: 1
      }
    },
    {
      source: 'file2',
      metrics: {
        length: 3,
        vocabulary: 2,
        volume: 3,
        difficulty: 1,
        effort: 3,
        time: 0.16666666666666666,
        bugsDelivered: 0.0006933612743506347,
        operands: {
          total: 2,
          _unique: {},
          unique: 1
        },
        operators: {
          total: 1,
          _unique: {},
          unique: 1
        },
        complexity: 1
      }
    }
  ])
}))

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined)
}))
jest.mock('@actions/core', () => ({
  debug: jest.fn().mockReturnValue(undefined),
  info: jest.fn().mockReturnValue(undefined)
}))
describe.skip(__filename, () => {
  it('calls getSourceFile', async () => {
    const filename = await analyze(
      'sha',
      'actor',
      'workingDirectory',
      ts.ScriptTarget.ES2018
    )
    expect(filename).toEqual('complexity-assessment/sha.json')
  })
  it('calls analyzeTypeScript', async () => {
    await analyze('sha', 'actor', 'workingDirectory', ts.ScriptTarget.ES2018)
    expect(analyzeTypeScript).toBeCalledWith(
      ['file1', 'file2'],
      ts.ScriptTarget.ES2018
    )
  })
  it('makes a directory', () => {})
  it('writes a file', () => {})
  it('returns the filename', async () => {
    const filename = await analyze(
      'sha',
      'actor',
      'workingDirectory',
      ts.ScriptTarget.ES2018
    )
    expect(filename).toEqual('complexity-assessment/sha.json')
  })
})
