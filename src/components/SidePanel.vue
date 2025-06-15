<script setup>
import { ref, computed } from 'vue'
import { useObjectsStore } from '@/stores/objectsStore'
import PropertiesPanel from './PropertiesPanel.vue'
import ObjectsPanel from './ObjectsPanel.vue'

const objectsStore = useObjectsStore()

const manualTab = ref('properties')

const activeTab = computed(() => { // disabled auto, was annoying // re-enabled - shit broke without it and it's 8am with no sleep, exam at 10..
  if (manualTab.value) {
    return manualTab.value
  }
  return objectsStore.hasSelection ? 'properties' : 'objects'
})

const tabs = [
  { id: 'objects', label: 'Objects', icon: '📋' },
  { id: 'properties', label: 'Properties', icon: '⚙️' }
]

function switchTab(tabId) {
  manualTab.value = tabId
}

const hasSelection = computed(() => objectsStore.hasSelection)
let previousHasSelection = hasSelection.value

setInterval(() => {
  if (previousHasSelection && !hasSelection.value) {
    manualTab.value = null
  }
  previousHasSelection = hasSelection.value
}, 100)
</script>

<template>
  <div class="h-full bg-gray-700 flex flex-col">
    
    <div class="flex border-b border-gray-600 bg-gray-800">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'flex-1 px-3 py-2 text-sm font-medium transition-colors',
          activeTab === tab.id
            ? 'bg-gray-700 text-gray-100 border-b-2 border-blue-400'
            : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700 cursor-pointer'
        ]"
        @click="switchTab(tab.id)"
      >
        <span class="mr-1">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <div class="flex-1 overflow-hidden">

      <div v-if="activeTab === 'objects'" class="h-full">
        <ObjectsPanel />
      </div>
      
      
      <div v-if="activeTab === 'properties'" class="h-full">
        <PropertiesPanel />
      </div>

    </div>
  </div>
</template> 