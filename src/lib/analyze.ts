import ts from 'typescript'
import {getSourceFile} from './utils'
import { analyzeTypeScript } from './harvest'
import { existsSync } from 'fs'
import {mkdir, writeFile} from 'fs/promises'

export async function analyze(
  sha: string,
  actor: string,
  workingDirectory: string,
  scriptTarget: ts.ScriptTarget
): Promise<string> {
  const include = /\.ts$/
  const exclude = /\.d.ts|__mocks__|.test.ts/
  const sourceFiles = await getSourceFile(workingDirectory, include, exclude)
  const analysis = await analyzeTypeScript(sourceFiles, scriptTarget)

  const complexities = analysis.map(({report}) => {
    const functions = Object.keys(report)
    const functionComplexity = functions.map(func => report[func].complexity)
    const max = Object.values(functionComplexity).reduce((prev, cur) => {
      return prev > cur ? prev : cur
    }, 0)
    return max
  })

  const total = complexities.reduce((prev, cur) => +prev + +cur, 0)
  const folder = 'complexity-assessment'
  const filename = `${folder}/${sha}-complexity.json`
  const analytics = {
    totalComplexity: total,
    sha,
    actor,
    analysis,
    dateUtc: new Date().toISOString()
  }
  if (!existsSync(folder)) {
    await mkdir(folder)
  }

  await writeFile(filename, JSON.stringify(analytics, undefined, 2))

  return filename
}
