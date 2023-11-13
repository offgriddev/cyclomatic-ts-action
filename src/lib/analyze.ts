import ts from 'typescript'
import { mkdir, writeFile } from 'fs/promises'
import { getSourceFile } from './utils'
import { analyzeTypeScript } from './harvest'
import { context } from '@actions/github'
import { PushEvent, getPushDetails } from './github'

export async function analyze(
  workingDirectory: string,
  scriptTarget: ts.ScriptTarget,
  githubToken: string,
  event: unknown
): Promise<string> {
  const include = /\.ts$/
  const exclude = /\.d.ts|__mocks__|.test.ts/
  const sourceFiles = await getSourceFile(workingDirectory, include, exclude)
  const analysis = await analyzeTypeScript(sourceFiles, scriptTarget)
  const complexities = analysis.map(({ report }) => {
    const functions = Object.keys(report)
    const functionComplexity = functions.map(func => report[func].complexity)

    // axiom: the complexity of a module is the highest complexity of any of its functions
    const max = Object.values(functionComplexity).reduce((prev, cur) => {
      return prev > cur ? prev : cur
    }, 0)
    return max
  })
  /**
   * Construct final model
   */
  const total = complexities.reduce((prev, cur) => +prev + +cur, 0)
  const folder = 'complexity-assessment'
  const filename = `${folder}/${context.sha}.json`

  // get the first commit in the event, which should be the merge commit
  const baseMetrics = {
    totalComplexity: total,
    sha: context.sha,
    ref: context.ref,
    repository: context.repo,
    analysis,
    dateUtc: new Date().toISOString()
  }

  const prBase = {
    head: context.payload.pull_request?.head.ref,
    actor: context.actor
  }
  const pushBase = await getPushDetails(githubToken, event as PushEvent)
  // pull_request will be empty on a push
  const isPushRequest = !!pushBase
  const analytics = isPushRequest
    ? {
        ...pushBase,
        ...baseMetrics
      }
    : { ...prBase, ...baseMetrics }
  await mkdir(folder)
  await writeFile(filename, JSON.stringify(analytics, undefined, 2))

  return filename
}
