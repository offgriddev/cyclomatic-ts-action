import * as core from '@actions/core'
import { analyze } from './lib/analyze'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const sha = core.getInput('sha')
    const actor = core.getInput('actor')
    const workingDirectory = core.getInput('working_directory') || './'
    // const workingDirectories = core.getInput('working_directories') || ''
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scriptTarget: any = core.getInput('ecma_script_target')

    const filename = await analyze(sha, actor, workingDirectory, scriptTarget)

    core.setOutput('export_filename', filename)
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
