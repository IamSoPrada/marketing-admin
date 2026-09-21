import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockDelay, nextId } from '@/common/shared/api/mock'
import { catalogItems } from '@/common/shared/mocks/catalog'
import type { Collection, CollectionStatus } from '@/modules/Collections/entities/model/types'

const initialCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Лучшие питомцы для Neon',
    slug: 'neon-pets',
    description: 'Самые востребованные питомцы для неоновых билдов.',
    type: 'manual',
    status: 'published',
    itemIds: ['duck', 'golden-duck', 'frost-dragon', 'shadow-dragon', 'magma-moose', 'evil-unicorn', 'arctic-reindeer', 'bat-dragon'],
    seoTitle: 'Лучшие питомцы Neon — купить на Playmarket',
    seoDescription: 'Подборка топовых питомцев для Neon-билдов в Adopt Me.',
    primaryColor: '#635bff',
    updatedAt: '2026-09-21T11:42:00'
  },
  {
    id: 'col-2',
    name: 'Пасхальная коллекция',
    slug: 'easter-2026',
    description: 'Сезонная подборка к пасхальному ивенту.',
    type: 'live',
    status: 'published',
    itemIds: ['duck', 'golden-duck', 'diamond-butterfly', 'neon-cat', 'mega-dog', 'huge-cat', 'gamer-dragon', 'pixel-wolf', 'giraffe'],
    seoTitle: 'Пасхальная коллекция 2026',
    seoDescription: 'Все пасхальные товары в одной подборке.',
    primaryColor: '#22a06b',
    updatedAt: '2026-09-20T16:08:00'
  },
  {
    id: 'col-3',
    name: 'Все утки',
    slug: 'all-ducks',
    description: '',
    type: 'manual',
    status: 'draft',
    itemIds: ['duck', 'golden-duck'],
    seoTitle: '',
    seoDescription: '',
    primaryColor: '#f5a524',
    updatedAt: '2026-09-20T10:15:00'
  },
  {
    id: 'col-4',
    name: 'Редкие питомцы',
    slug: 'rare-pets',
    description: 'Питомцы с высокой редкостью и спросом.',
    type: 'manual',
    status: 'unpublished',
    itemIds: ['frost-dragon', 'shadow-dragon', 'bat-dragon', 'giraffe', 'evil-unicorn', 'arctic-reindeer', 'diamond-butterfly', 'magma-moose', 'golden-duck'],
    seoTitle: 'Редкие питомцы Adopt Me',
    seoDescription: 'Каталог редких питомцев с актуальными ценами.',
    primaryColor: '#8b5cf6',
    updatedAt: '2026-09-18T14:02:00'
  }
]

export const useCollectionsStore = defineStore('collections', () => {
  const collections = ref<Collection[]>([...initialCollections])
  const catalog = ref(catalogItems)

  const active = computed(() => collections.value.filter((c) => c.status !== 'archived'))
  const archived = computed(() => collections.value.filter((c) => c.status === 'archived'))

  const byId = (id: string) => collections.value.find((c) => c.id === id)
  const isSlugTaken = (slug: string, exceptId?: string) =>
    collections.value.some((c) => c.slug === slug && c.id !== exceptId)

  function touch(collection: Collection) {
    collection.updatedAt = new Date().toISOString()
  }

  async function createDraft(payload: Omit<Collection, 'id' | 'status' | 'updatedAt'>): Promise<Collection> {
    await mockDelay()
    const collection: Collection = {
      ...payload,
      id: nextId('col'),
      status: 'draft',
      updatedAt: new Date().toISOString()
    }
    collections.value.unshift(collection)
    return collection
  }

  async function update(id: string, patch: Partial<Collection>): Promise<void> {
    await mockDelay()
    const collection = byId(id)
    if (!collection) return
    Object.assign(collection, patch)
    touch(collection)
  }

  async function publish(id: string): Promise<void> {
    await mockDelay()
    const collection = byId(id)
    if (!collection) return
    collection.status = 'published'
    touch(collection)
  }

  async function unpublish(id: string): Promise<void> {
    await mockDelay()
    const collection = byId(id)
    if (!collection) return
    collection.status = 'unpublished'
    touch(collection)
  }

  async function archive(id: string): Promise<void> {
    await mockDelay()
    const collection = byId(id)
    if (!collection) return
    collection.status = 'archived'
    touch(collection)
  }

  async function unarchive(id: string): Promise<void> {
    await mockDelay()
    const collection = byId(id)
    if (!collection) return
    collection.status = 'draft'
    touch(collection)
  }

  async function duplicate(id: string, name: string): Promise<Collection | undefined> {
    await mockDelay()
    const source = byId(id)
    if (!source) return undefined
    const copy: Collection = {
      ...source,
      id: nextId('col'),
      name,
      slug: nextSlug(source.slug),
      status: 'draft',
      itemIds: [...source.itemIds],
      updatedAt: new Date().toISOString()
    }
    collections.value.unshift(copy)
    return copy
  }

  async function remove(id: string): Promise<void> {
    await mockDelay()
    collections.value = collections.value.filter((c) => c.id !== id)
  }

  function nextSlug(base: string): string {
    let candidate = `${base}-copy`
    let index = 2
    while (isSlugTaken(candidate)) {
      candidate = `${base}-copy-${index}`
      index += 1
    }
    return candidate
  }

  function statusCounts(list: Collection[]): Record<CollectionStatus, number> {
    return list.reduce(
      (acc, c) => {
        acc[c.status] += 1
        return acc
      },
      { draft: 0, published: 0, unpublished: 0, archived: 0 } as Record<CollectionStatus, number>
    )
  }

  return {
    collections,
    catalog,
    active,
    archived,
    byId,
    isSlugTaken,
    createDraft,
    update,
    publish,
    unpublish,
    archive,
    unarchive,
    duplicate,
    remove,
    nextSlug,
    statusCounts
  }
})
