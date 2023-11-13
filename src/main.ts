import * as core from '@actions/core'
import { analyze } from './lib/analyze'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const workingDirectory = core.getInput('working_directory') || './'
    const githubToken = core.getInput('github_token')
    const event = JSON.parse(core.getInput('event'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scriptTarget: any = core.getInput('ecma_script_target')
    const filename = await analyze(
      workingDirectory,
      scriptTarget,
      githubToken,
      event
    )
    core.setOutput('export_filename', filename)
  } catch (error) {
    core.setFailed(error as Error)
    core.setFailed(`${(error as Error).stack}`)
  }
}
