// Some logic with https://github.com/1Password/onepassword-operator/blob/main/pkg/onepassword/items.go#L53

import { OPConnect } from '@1password/connect/dist/lib/op-connect'
import { is_valid_client_uuid } from './uuid'
import * as core from '@actions/core'
import { SecretReference } from '../types'

export async function get_vault_id(
  client: OPConnect,
  vault_identifier: string
): Promise<string> {
  if (!is_valid_client_uuid(vault_identifier)) {
    const vaults = await client.listVaultsByTitle(vault_identifier)
    if (vaults.length === 0) {
      throw new Error(`No vaults found with identifier ${vault_identifier}`)
    }
    let oldest_vault = vaults[0]
    if (vaults.length > 1) {
      oldest_vault = vaults.sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      )[0]
      core.info(
        `${vaults.length} 1Password vaults found with the title ${vault_identifier}. Will use vault ${oldest_vault.id} as it is the oldest.`
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    vault_identifier = oldest_vault.id!
  }
  return vault_identifier
}

export async function get_item_id(
  client: OPConnect,
  item_identifier: string,
  vault_id: string
): Promise<string> {
  if (!is_valid_client_uuid(item_identifier)) {
    const items = await client.listItemsByTitle(vault_id, item_identifier)
    if (items.length === 0) {
      throw new Error(`No items found with identifier ${item_identifier}`)
    }
    let oldest_item = items[0]
    if (items.length > 1) {
      oldest_item = items.sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      )[0]
      core.info(
        `${items.length} 1Password items found with the title ${item_identifier}. Will use item ${oldest_item.id} as it is the oldest.`
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    item_identifier = oldest_item.id!
  }
  return item_identifier
}

/**
 * `op://<vault-name>/<item-name>/[section-name/]<field-name>`
 */
export const REGEX =
  /^op:\/\/(?<vault_name>[^/]+)\/(?<item_name>[^/]+)\/((?<section_name>[^/]+)\/)?(?<field_name>[^/]+)$/

export async function resolve_by_path(
  client: OPConnect,
  path: string
): Promise<string | undefined> {
  const match = REGEX.exec(path)
  if (!match) {
    throw new Error(`Invalid secret reference: ${path}`)
  }
  const { vault_name, item_name, section_name, field_name } =
    match.groups as SecretReference

  const vault_id = await get_vault_id(client, vault_name)
  const item_id = await get_item_id(client, item_name, vault_id)
  const item = await client.getItemById(vault_id, item_id)

  let item_fields = item.fields
  if (section_name) {
    // how to deal with same label and id?
    const section = item.sections?.filter(
      s => s.label === section_name || s.id === section_name
    )
    if (section && section.length > 0) {
      item_fields = item_fields?.filter(f => f.section?.id === section[0].id)
    }
  }
  const filed = item_fields?.filter(
    f => f.id === field_name || f.label === field_name
  )[0]
  return filed?.value
}
