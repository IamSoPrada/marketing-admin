export type CollectionStatus = 'draft' | 'published' | 'unpublished' | 'archived'
export type CollectionType = 'manual' | 'live'

export interface CatalogItem {
  id: string
  name: string
  game: string
  groups: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  type: CollectionType
  status: CollectionStatus
  itemIds: string[]
  seoTitle: string
  seoDescription: string
  primaryColor: string
  updatedAt: string
}

export const COLLECTION_STATUS_LABELS: Record<CollectionStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликована',
  unpublished: 'Снята с публикации',
  archived: 'Архивирована'
}

export const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  manual: 'Ручная',
  live: 'Живая'
}

/** Минимальный состав подборки для публикации (бизнес-правило). */
export const MIN_COLLECTION_ITEMS = 8

export const GAMES = ['Adopt Me', 'Murder Mystery 2', 'Pet Simulator 99', 'Blox Fruits']
