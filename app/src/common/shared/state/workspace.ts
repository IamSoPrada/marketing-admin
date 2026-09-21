import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockDelay, nextId } from '@/common/shared/api/mock'

export type WorkspaceAccess = 'private' | 'team'

export interface Workspace {
  id: string
  name: string
  description: string
  color: string
  access: WorkspaceAccess
}

const initialWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Marketing space',
    description: 'Игровой маркетплейс',
    color: '#635bff',
    access: 'private'
  }
]

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([...initialWorkspaces])
  const currentId = ref('ws-1')

  const current = computed(() => workspaces.value.find((w) => w.id === currentId.value) ?? workspaces.value[0])

  async function create(payload: Omit<Workspace, 'id'>): Promise<Workspace> {
    await mockDelay()
    const workspace: Workspace = { ...payload, id: nextId('ws') }
    workspaces.value.push(workspace)
    currentId.value = workspace.id
    return workspace
  }

  async function update(id: string, patch: Partial<Omit<Workspace, 'id'>>): Promise<void> {
    await mockDelay()
    const workspace = workspaces.value.find((w) => w.id === id)
    if (workspace) Object.assign(workspace, patch)
  }

  function switchTo(id: string) {
    if (workspaces.value.some((w) => w.id === id)) currentId.value = id
  }

  return { workspaces, currentId, current, create, update, switchTo }
})
