import { Item, ResolveSecretReference, Vault } from './types'
import { $Fetch, ofetch } from 'ofetch'
import process from 'node:process'
import { envConnectHost, envConnectToken } from '../constants'
import assert from 'node:assert'

export class Connect implements ResolveSecretReference {
  // `op://<vault-name>/<item-name>/[section-name/]<field-name>`
  static REGEX =
    /^op:\/\/(?<vault_name>[^/]+)\/(?<item_name>[^/]+)\/((?<section_name>[^/]+)\/)?(?<field_name>[^/]+)$/

  api: $Fetch

  constructor() {
    assert(process.env[envConnectHost], `${envConnectHost} is required`)
    assert(process.env[envConnectToken], `${envConnectToken} is required`)

    this.api = ofetch.create({
      baseURL: `${process.env[envConnectHost]}`,
      headers: {
        Authorization: `Bearer ${process.env[envConnectToken]}`
      }
    })
  }

  async resolve(ref: string): Promise<string> {
    const match = Connect.REGEX.exec(ref)
    if (!match) {
      throw new Error(`Invalid secret reference: ${ref}`)
    }
    const { vault_name, item_name, section_name, field_name } =
      match.groups as {
        vault_name: string
        item_name: string
        section_name: string | null
        field_name: string
      }

    const first_item = async <T = Vault | Item>(
      res: Promise<T[]>,
      predicate: (v: T) => boolean
    ): Promise<T> => {
      const items = (await res).filter(predicate)
      if (items.length === 0) {
        throw new Error('No items found')
      }
      return items[0]
    }

    // cache response may cause other potential security issues
    const vault = await first_item(
      this.api<Vault[]>('/v1/vaults'),
      v => v.name === vault_name || v.id === vault_name
    )
    const item = await first_item(
      this.api<Item[]>(`/v1/vaults/${vault.id}/items`),
      i => i.title === item_name || i.id === item_name
    )
    const item_detail = await this.api<Item>(
      `/v1/vaults/${vault.id}/items/${item.id}`
    )
    let section_id: string | undefined
    if (section_name) {
      const section = item_detail.sections.filter(
        s => s.label === section_name || s.id === section_name
      )[0]
      section_id = section.id
    }
    const field = item_detail.fields
      .filter(f => {
        if (section_id) {
          return f.section?.id === section_id
        }
        return true
      })
      .filter(f => f.label === field_name || f.id === field_name)[0]
    return field.value
  }
}
