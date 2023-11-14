import ts from 'typescript'
import * as core from '@actions/core'
import { mkdir, writeFile } from 'fs/promises'
import { getSourceFile } from './utils'
import { analyzeTypeScript } from './harvest'
import { context } from '@actions/github'
import { PushEvent, getPushDetails } from './github'
import { printReport } from './report'
import { existsSync } from 'fs'

export async function analyze(
  workingDirectory: string,
  scriptTarget: ts.ScriptTarget,
  githubToken: string,
  event: unknown
): Promise<string> {
  const include = /\.ts$/
  const exclude = /\.d.ts|__mocks__|.test.ts/
  const sourceFiles = await getSourceFile(workingDirectory, include, exclude)
  const files = await analyzeTypeScript(sourceFiles, scriptTarget)
  const complexities = files.map((file) => {
    core.info(JSON.stringify(file, undefined, 2))
    const functions = Object.keys(file.report)
    if (functions.length === 0) return 0
    const functionComplexity = functions.map(func => file.report[func])

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

  // get the first commit in the event, which should be the merge commit
  const baseMetrics = {
    totalComplexity: total,
    sha: context.sha,
    ref: context.ref,
    repository: context.repo,
    files,
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
  await printReport(analytics)
  const folder = 'complexity-assessment'
  const filename = `${folder}/${analytics.repository.repo}/${context.sha}-${analytics.actor}-infrastructure.json`
  core.info(`Report saved to: ${filename}`)
  if (!existsSync(folder)) await mkdir(folder)
  if (!existsSync(`${folder}/${analytics.repository.repo}`))
  await writeFile(filename, JSON.stringify(analytics, undefined, 2))

  return filename
}
