import * as process from 'node:process'
import * as core from '@actions/core'
import {
  authErr,
  ENV_MANAGED_VARIABLES,
  envServiceAccountToken
} from './constants'
import { ResolveSecretReference } from './service/types'
import { Account } from './service/account'
import { Connect } from './service/connect'

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
  let resolver: ResolveSecretReference
  try {
    if (process.env[envServiceAccountToken]) {
      resolver = new Account()
    } else {
      resolver = new Connect()
    }
  } catch {
    throw new Error(authErr)
  }

  for (const [key, ref] of Object.entries(refs)) {
    const secret = await resolver.resolve(ref)
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
