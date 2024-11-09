import * as core from '@actions/core'
import {
  load_secret_refs_from_env,
  load_secrets,
  unset_previous
} from './utils'

export async function run(): Promise<void> {
  try {
    const should_unset_previous = core.getBooleanInput('unset_previous')
    const export_env = core.getBooleanInput('export_env')

    if (should_unset_previous) {
      unset_previous()
    }

    const refs = load_secret_refs_from_env()
    await load_secrets(refs, export_env)
  } catch (error) {
    console.log(error)
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      core.setFailed(String(error))
    }
  }
}
