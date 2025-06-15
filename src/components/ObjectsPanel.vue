<script setup>
import { computed } from 'vue'
import * as fabric from 'fabric'
import { useObjectsStore } from '@/stores/objectsStore'

const objectsStore = useObjectsStore()

const objectsList = computed(() => {
  return objectsStore.allObjects.map((obj, index) => ({
    object: obj,
    id: index,
    type: obj.type || 'unknown',
    name: obj.name || getDefaultName(obj.type || 'unknown', index),
    fill: obj.fill || '#000000',
    stroke: obj.stroke || '#000000',
    isSelected: objectsStore.selectedObjects.includes(obj)
  }))
})

const getDefaultName = objectsStore.getDefaultName || ((type, index) => {
  const typeNames = {
    'rect': 'Rectangle',
    'circle': 'Circle', 
    'triangle': 'Triangle',
    'line': 'Line',
    'group': 'Group',
    'path': 'Path'
  }
  return `${typeNames[type] || 'Object'} ${index + 1}`
})

function getShapeIcon(type, name = '') {
  const icons = {
    'rect': `<rect x="2" y="2" width="12" height="12" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`,
    'circle': `<circle cx="8" cy="8" r="6" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`,
    'triangle': `<polygon points="8,2 14,14 2,14" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`,
    'line': `<line x1="2" y1="8" x2="14" y2="8" stroke="var(--stroke-color)" stroke-width="2"/>`,
    'polygon': `<polygon points="8,1 13,4.5 13,11.5 8,15 3,11.5 3,4.5" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`,
    'ellipse': `<ellipse cx="8" cy="8" rx="6" ry="4" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`,
    'group': `<g stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5">
               <rect x="1" y="1" width="7" height="7"/>
               <rect x="8" y="8" width="7" height="7"/>
             </g>`,
    'path': `<path d="M8 14s6-5.686 6-10A4 4 0 0 0 8 1.314 4 4 0 0 0 2 4c0 4.314 6 10 6 10z" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`
  }
  
  if (name) {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('star')) {
      return `<polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`
    }
    if (lowerName.includes('arrow')) {
      return `<polygon points="2,6 2,10 10,10 10,13 14,8 10,3 10,6" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`
    }
    if (lowerName.includes('diamond')) {
      return `<polygon points="8,1 15,8 8,15 1,8" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`
    }
    if (lowerName.includes('heart')) {
      return `<path d="M8 14s6-5.686 6-10A4 4 0 0 0 8 1.314 4 4 0 0 0 2 4c0 4.314 6 10 6 10z" stroke="var(--stroke-color)" fill="var(--fill-color)" fill-opacity="0.7" stroke-width="1.5"/>`
    }
    if (lowerName.includes('quartered')) {
      return `<g stroke="var(--stroke-color)" fill="none" stroke-width="1.5">
               <circle cx="8" cy="8" r="6"/>
               <line x1="2" y1="8" x2="14" y2="8"/>
               <line x1="8" y1="2" x2="8" y2="14"/>
             </g>`
    }
  }
  
  return icons[type] || icons['rect']
}

function selectObject(obj, event) {
  if (!objectsStore.canvas) return
  
  if (event?.shiftKey && false) { // broken - jumping issue ofc
    const currentSelection = objectsStore.canvas.getActiveObjects()
    
    if (currentSelection.includes(obj)) {
      const newSelection = currentSelection.filter(o => o !== obj)
      if (newSelection.length === 0) {
        objectsStore.canvas.discardActiveObject()
      } else if (newSelection.length === 1) {
        objectsStore.canvas.setActiveObject(newSelection[0])
      } else {
        const activeSelection = new fabric.ActiveSelection(newSelection, {
          canvas: objectsStore.canvas
        })
        objectsStore.canvas.setActiveObject(activeSelection)
      }
    } else {
      const newSelection = [...currentSelection, obj]
      if (newSelection.length === 1) {
        objectsStore.canvas.setActiveObject(newSelection[0])
      } else {
        const activeSelection = new fabric.ActiveSelection(newSelection, {
          canvas: objectsStore.canvas
        })
        objectsStore.canvas.setActiveObject(activeSelection)
      }
    }
  } else {
    objectsStore.canvas.setActiveObject(obj)
  }
  
  objectsStore.canvas.renderAll()
}

function getColorStyle(color) {
  if (!color) return '#ffffff'
  return color
}
</script>

<template>
  <div class="h-full p-3 lg:p-4 overflow-y-auto">
    <h2 class="text-lg font-semibold mb-3 text-gray-100">Objects</h2>
    
    <!-- Empty  -->
    <div v-if="objectsList.length === 0" class="text-gray-400 text-center py-8">
      <div class="text-4xl mb-2">🎨</div>
      <div>No objects on canvas</div>
      <div class="text-sm mt-1">Add shapes using the toolbar</div>
    </div>

    <!-- list -->
    <div v-else class="space-y-2">
      <div
        v-for="item in objectsList"
        :key="item.id"
        :class="[
          'flex items-center gap-3 rounded-lg border transition-all cursor-pointer',
          item.isSelected 
            ? 'bg-blue-600/20 border-blue-400 text-gray-100' 
            : 'bg-gray-600/50 border-gray-500 text-gray-200 hover:bg-gray-600 hover:border-gray-400'
        ]"
        @click="selectObject(item.object, $event)"
        :title="item.isSelected ? 'Selected (Shift+click to deselect)' : 'Click to select (Shift+click for multi-selection)'"
      >
        <!-- Icon -->
        <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center ml-2">
          <svg 
            class="w-6 h-6" 
            viewBox="0 0 16 16" 
            v-html="getShapeIcon(item.type, item.name)"
            :style="{ 
              '--fill-color': getColorStyle(item.fill), 
              '--stroke-color': getColorStyle(item.stroke) 
            }"
          ></svg>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 py-2">
          <div class="font-medium text-sm truncate">{{ item.name }}</div>
          <div class="text-xs opacity-75">{{ item.type }}</div>
        </div>

        <!-- Selection -->
        <div class="p-2">
          <div 
            :class="[
              'w-5 h-5 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center',
              item.isSelected 
                ? 'bg-blue-400 border-blue-400 text-white' 
                : 'border-gray-400'
            ]"
            :title="item.isSelected ? 'Selected' : 'Not selected'"
          >
            <svg v-if="item.isSelected" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Count -->
    <div v-if="objectsStore.hasSelection" class="mt-4 pt-3 border-t border-gray-600">
      <div class="text-sm text-gray-300 mb-2">
        {{ objectsStore.selectedObjects.length }} object{{ objectsStore.selectedObjects.length !== 1 ? 's' : '' }} selected
      </div>
    </div>
  </div>
</template> 