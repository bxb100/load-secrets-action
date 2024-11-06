export interface ResolveSecretReference {
  resolve(ref: string): Promise<string>
}

export interface Vault {
  id: string
  name: string
  attributeVersion: number
  contentVersion: number
  items: number
  type: string
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  title: string
  tags: string[]
  vault: {
    id: string
  }
  category: string
  sections: {
    id: string
    label: string
  }[]
  fields: ItemField[]
  files: {
    id: string
    name: string
    size: number
    content_path: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface ItemField {
  id: string
  type: string
  purpose: string
  label: string
  value: string
  entropy?: number
  section?: {
    id: string
  }
}
