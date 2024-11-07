import { Item, ItemField, ResolveSecretReference, Vault } from './types'
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

  // It should same as `op inject` command, because the audit log showed as it is.
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

    const find_item = <T = Vault | Item | ItemField>(
      items: Awaited<T[]>,
      id_predicate: (v: T) => boolean,
      name_predicate: (v: T) => boolean
    ): T => {
      const id_res = items.find(id_predicate)
      if (id_res) {
        return id_res
      }
      const name_res = items.filter(name_predicate)
      if (name_res.length > 1) {
        throw new Error('Multiple items found')
      } else if (name_res.length === 1) {
        return name_res[0]
      }
      throw new Error('No items found')
    }

    // cache response may cause other potential security issues
    const vault = find_item(
      await this.api<Vault[]>('/v1/vaults'),
      v => v.id === vault_name,
      v => v.name === vault_name
    )
    const item = find_item(
      await this.api<Item[]>(`/v1/vaults/${vault.id}/items`),
      i => i.id === item_name,
      i => i.title === item_name
    )
    const item_detail = await this.api<Item>(
      `/v1/vaults/${vault.id}/items/${item.id}`
    )
    let item_fields = item_detail.fields
    if (section_name) {
      const section = item_detail.sections.filter(
        s => s.label === section_name || s.id === section_name
      )[0]
      item_fields = item_fields.filter(f => f.section?.id === section.id)
    }

    return find_item(
      item_fields,
      f => f.id === field_name,
      f => f.label === field_name
    ).value
  }
}
