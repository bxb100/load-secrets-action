import * as process from 'node:process'
import { createClient } from '@1password/sdk'
import assert from 'node:assert'
import * as core from '@actions/core'
import { ENV_MANAGED_VARIABLES, TOKEN_NAME } from './constants'

export function load_secret_refs_from_env(): Record<string, string> {
  // secret references `op://<vault-name>/<item-name>/[section-name/]<field-name>`
  const refs = Object.entries(process.env).filter(
    ([, v]) => v && v.startsWith('op://')
  ) as [string, string][]

  return Object.fromEntries(refs)
}

export async function load_secrets(
  refs: Record<string, string>,
  export_env: boolean
): Promise<void> {
  assert(process.env[TOKEN_NAME], `${TOKEN_NAME} is required`)

  const client = await createClient({
    auth: process.env[TOKEN_NAME],
    integrationName: '1Password GitHub Action',
    integrationVersion: 'v0.1.0'
  })

  for (const [key, ref] of Object.entries(refs)) {
    const secret = await client.secrets.resolve(ref)
    // mask secret in logs
    core.setSecret(secret)
    if (export_env) {
      core.exportVariable(key, secret)
    } else {
      core.setOutput(key, secret)
    }
  }

  if (export_env) {
    core.exportVariable(ENV_MANAGED_VARIABLES, Object.keys(refs).join(','))
  }
}

export function unset_previous(): void {
  const previous = process.env[ENV_MANAGED_VARIABLES]
  if (previous) {
    core.info('Unsetting previous values ...')
    for (const key of previous.split(',')) {
      core.info(`Unsetting ${key}`)
      core.exportVariable(key, '')
    }
  }
}
