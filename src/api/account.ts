import { ResolveSecretReference } from './types'
import { Client, createClient } from '@1password/sdk'
import process from 'node:process'
import { envServiceAccountToken } from '../constants'
import assert from 'node:assert'

export class Account implements ResolveSecretReference {
  token: string

  constructor() {
    assert(
      process.env[envServiceAccountToken],
      `${envServiceAccountToken} is required`
    )
    this.token = process.env[envServiceAccountToken]
  }

  async init(): Promise<Client> {
    return createClient({
      auth: this.token,
      integrationName: '1Password GitHub Action',
      integrationVersion: 'v0.1.0'
    })
  }

  async resolve(ref: string): Promise<string> {
    const client = await this.init()
    return client.secrets.resolve(ref)
  }
}
