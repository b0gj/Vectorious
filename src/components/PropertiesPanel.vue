<script setup>
import { computed } from 'vue'
import { useObjectsStore } from '@/stores/objectsStore'

const objectsStore = useObjectsStore()

const hasSelection = computed(() => objectsStore.hasSelection)
const isSingleSelection = computed(() => objectsStore.isSingleSelection)
const isMultiSelection = computed(() => objectsStore.isMultiSelection)
const commonProperties = computed(() => objectsStore.commonProperties)

function updateProp(property, value) {
  objectsStore.updateProperty(property, value)
}

function formatNumber(num) {
  if (num === null || num === undefined) return ''
  return Number(num).toFixed(2).replace(/\.?0+$/, '')
}

function toHexColor(color) {
  if (!color || color === null) return '#000000' // default
  
  if (typeof color === 'string' && color.startsWith('#')) { // already hex
    return color
  }
  
  if (typeof color === 'string' && color.startsWith('rgb')) { // rgb to hex
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0')
      const g = parseInt(match[2]).toString(16).padStart(2, '0')
      const b = parseInt(match[3]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
  }
  
  return '#000000'
}

const displayFill = computed(() => {
  const fill = commonProperties.value.fill
  return fill === null ? '' : toHexColor(fill)
})

const displayStroke = computed(() => {
  const stroke = commonProperties.value.stroke
  return stroke === null ? '' : toHexColor(stroke)
})

function updateObjectName(name) {
  if (isSingleSelection.value) {
    objectsStore.updateProperty('name', name)
  }
}

function updateCanvasBackground(color) {
  objectsStore.updateCanvasBackground(color)
}

function updateCanvasTitle(title) {
  objectsStore.updateCanvasTitle(title)
}
</script>

<template>
  <div class="h-full bg-gray-700 p-3 lg:p-4 overflow-y-auto">
    <h2 class="text-lg font-semibold mb-3 text-gray-100">Properties</h2>
    
    
    <div v-if="!hasSelection" class="space-y-4">
      <div class="text-center py-4 border-b border-gray-600">
        <div class="text-lg font-medium text-gray-200 mb-1">Canvas Settings</div>
        <!-- <div class="text-sm text-gray-400">Configure your canvas properties</div> -->
      </div>
      

      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Canvas Title</h3>
        <input
          type="text"
          :value="objectsStore.canvasTitle"
          @input="updateCanvasTitle($event.target.value)"
          placeholder="Enter canvas title"
          class="w-full px-3 py-2 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
        />
        <div class="text-xs text-gray-400">
          💡 Used for export filenames and project identification
        </div>
      </div>
      

      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Background Color</h3>
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="objectsStore.canvasBackgroundColor"
            @input="updateCanvasBackground($event.target.value)"
            class="w-8 h-8 border border-gray-500 rounded cursor-pointer flex-shrink-0 bg-gray-600"
          />
          <input
            type="text"
            :value="objectsStore.canvasBackgroundColor"
            @input="updateCanvasBackground($event.target.value)"
            placeholder="Enter hex color"
            class="flex-1 px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 min-w-0"
          />
        </div>
      </div>
      
      
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Canvas Info</h3>
        <div class="text-sm text-gray-300 space-y-1">
          <div>Zoom: {{ objectsStore.currentZoom }}%</div>
          <div>Objects: {{ objectsStore.allObjects.length }}</div>
        </div>
      </div>
      
      
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Quick Actions</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="objectsStore.resetZoom"
            class="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            🔍 Reset Zoom
          </button>
          
          <button
            v-if="objectsStore.hasClipboard"
            @click="objectsStore.pasteFromClipboard"
            class="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            📋 Paste
          </button>
        </div>
      </div>
    </div>

    <!-- Properties -->
    <div v-else class="space-y-3 lg:space-y-4">
      <!-- Count -->
      <!-- <div class="text-sm text-gray-300 mb-3">
        {{ isSingleSelection ? '1 object' : `${objectsStore.selectedObjects.length} objects` }} selected
      </div> -->

      <!-- Name -->
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Name</h3>
        <input
          type="text"
          :value="isSingleSelection ? (objectsStore.selectedObjects[0]?.name || '') : ''"
          @input="updateObjectName($event.target.value)"
          :placeholder="isSingleSelection ? 'Enter object name' : 'Multiple objects selected'"
          :disabled="!isSingleSelection"
          class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div v-if="!isSingleSelection" class="text-xs text-gray-400">
          Select a single object to edit its name
        </div>
      </div>

      <!-- Coords -->
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Position</h3>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">X</label>
            <input
              type="number"
              step="0.01"
              :value="formatNumber(commonProperties.left)"
              @input="updateProp('left', parseFloat($event.target.value) || 0)"
              :placeholder="commonProperties.left === null ? 'Mixed' : ''"
              class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">Y</label>
            <input
              type="number"
              step="0.01"
              :value="formatNumber(commonProperties.top)"
              @input="updateProp('top', parseFloat($event.target.value) || 0)"
              :placeholder="commonProperties.top === null ? 'Mixed' : ''"
              class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <!-- Scale (width, height) -->
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Scale</h3>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">Width</label>
            <input
              type="number"
              step="0.01"
              :value="formatNumber(commonProperties.scaleX)"
              @input="updateProp('scaleX', parseFloat($event.target.value) || 1)"
              :placeholder="commonProperties.scaleX === null ? 'Mixed' : ''"
              class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">Height</label>
            <input
              type="number"
              step="0.01"
              :value="formatNumber(commonProperties.scaleY)"
              @input="updateProp('scaleY', parseFloat($event.target.value) || 1)"
              :placeholder="commonProperties.scaleY === null ? 'Mixed' : ''"
              class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <!-- Rotation -->
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Transform</h3>
        
        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Rotation (°)</label>
          <input
            type="number"
            step="0.01"
            :value="formatNumber(commonProperties.angle)"
            @input="updateProp('angle', parseFloat($event.target.value) || 0)"
            :placeholder="commonProperties.angle === null ? 'Mixed' : ''"
            class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="commonProperties.opacity !== null ? commonProperties.opacity : 1"
            @input="updateProp('opacity', parseFloat($event.target.value))"
            class="w-full accent-blue-400"
          />
          <div class="text-xs text-gray-400 text-center mt-1">
            {{ commonProperties.opacity !== null ? Math.round(commonProperties.opacity * 100) : 'Mixed' }}%
          </div>
        </div>
      </div>

      
      <div class="space-y-2">
        <h3 class="font-medium text-gray-200 text-sm">Appearance</h3>
        
        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Fill Color</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              :value="displayFill || '#000000'"
              @input="updateProp('fill', $event.target.value)"
              class="w-8 h-8 border border-gray-500 rounded cursor-pointer flex-shrink-0 bg-gray-600"
            />
            <input
              type="text"
              :value="displayFill"
              @input="updateProp('fill', $event.target.value)"
              :placeholder="commonProperties.fill === null ? 'Mixed colors' : ''"
              class="flex-1 px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 min-w-0"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Stroke Color</label>
          <div class="flex items-center gap-2">
            <input
              type="color"
              :value="displayStroke || '#000000'"
              @input="updateProp('stroke', $event.target.value)"
              class="w-8 h-8 border border-gray-500 rounded cursor-pointer flex-shrink-0 bg-gray-600"
            />
            <input
              type="text"
              :value="displayStroke"
              @input="updateProp('stroke', $event.target.value)"
              :placeholder="commonProperties.stroke === null ? 'Mixed colors' : ''"
              class="flex-1 px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 min-w-0"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Stroke Width</label>
          <input
            type="number"
            min="0"
            step="0.01"
            :value="formatNumber(commonProperties.strokeWidth)"
            @input="updateProp('strokeWidth', parseFloat($event.target.value) || 0)"
            :placeholder="commonProperties.strokeWidth === null ? 'Mixed' : ''"
            class="w-full px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-3 border-t border-gray-600">
        <div class="space-y-2">
          <button
            @click="objectsStore.copySelected"
            class="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            Copy Selected (Ctrl+C)
          </button>
          
          <button
            @click="objectsStore.cutSelected"
            class="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            ✂️ Cut Selected (Ctrl+X)
          </button>
          
          <button
            v-if="objectsStore.hasClipboard"
            @click="objectsStore.pasteFromClipboard"
            class="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            📋 Paste (Ctrl+V)
          </button>
          
          <button
            @click="objectsStore.deleteSelected"
            class="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            Delete Selected
          </button>
        </div>
        
        <!-- Export -->
        <div class="pt-3 border-t border-gray-600">
          <h4 class="text-sm font-medium text-gray-200 mb-2">Export as Image</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="objectsStore.exportToPNG"
              class="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
            >
              🖼️ PNG
            </button>
            
            <button
              @click="objectsStore.exportToJPEG"
              class="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
            >
              📷 JPEG
            </button>
          </div>
          
          <button
            @click="objectsStore.exportToHighResPNG"
            class="w-full mt-2 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-colors"
          >
            🎯 High-Res PNG
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 