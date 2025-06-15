<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import VectoriousCanvas from './components/VectoriousCanvas.vue'
import SidePanel from './components/SidePanel.vue'
import ShapeToolbar from './components/ShapeToolbar.vue'
import { useObjectsStore } from './stores/objectsStore'

const objectsStore = useObjectsStore()
const fileInput = ref(null)
const showNewConfirmation = ref(false)

let lastKeyTime = 0
const keyDebounceDelay = 200 // 200ms debounce key presses

function showNewDialog() {
  showNewConfirmation.value = true
}

function confirmNew() {
  objectsStore.clearCanvas()
  showNewConfirmation.value = false
}

function cancelNew() {
  showNewConfirmation.value = false
}

function saveDesign() {
  objectsStore.saveToFile()
}

function loadDesign() {
  fileInput.value?.click()
}

async function handleFileLoad(event) {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    await objectsStore.loadFromFile(file)
    event.target.value = ''
  } catch (error) {
    alert(`Error loading file: ${error.message}`)
    event.target.value = ''
  }
}


function exportPNG() {
  objectsStore.exportToPNG()
}

function exportJPEG() {
  objectsStore.exportToJPEG()
}

function exportHighResPNG() {
  objectsStore.exportToHighResPNG()
}


function zoomIn() {
  objectsStore.zoomIn()
}

function zoomOut() {
  objectsStore.zoomOut()
}

function resetZoom() {
  objectsStore.resetZoom()
}


function undo() {
  objectsStore.undo()
}

function redo() {
  objectsStore.redo()
}


// keyboard shortcuts
function handleKeyDown(event) {
  const now = Date.now()
  if (now - lastKeyTime < keyDebounceDelay) { // debounce
    return
  }
  lastKeyTime = now
  
  const isTyping = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable // check if typing
  
  // Undo: Ctrl+Z
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
    return
  }
  
  // Redo: Ctrl+Y
  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
    return
  }
  
  if (isTyping) return // return if typing
  
  // Delete
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    if (objectsStore.hasSelection) {
      objectsStore.deleteSelected()
    }
    return
  }
  
  // Copy: Ctrl+C
  if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
    event.preventDefault()
    if (objectsStore.hasSelection) {
      objectsStore.copySelected()
    }
    return
  }
  
  // Cut: Ctrl+X
  if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
    event.preventDefault()
    if (objectsStore.hasSelection) {
      objectsStore.cutSelected()
    }
    return
  }
  
  // Paste: Ctrl+V
  if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    event.preventDefault()
    if (objectsStore.hasClipboard) {
      objectsStore.pasteFromClipboard()
    }
    return
  }
  
  // Save: Ctrl+S
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveDesign()
    return
  }
  
  // Escape: close modal
  if (event.key === 'Escape' && showNewConfirmation.value) {
    event.preventDefault()
    cancelNew()
    return
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="h-screen w-screen flex bg-gray-800 overflow-hidden">
    <!-- Canvas area with header -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-gray-900 shadow-lg border-b border-gray-600 px-4 py-2 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h1 class="text-sm font-medium text-gray-100">Vectorious</h1>
          
          <!-- File -->
          <div class="flex gap-2">
            <button
              @click="showNewDialog"
              class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
              title="Create new canvas (clears everything)"
            >
              📄 New
            </button>
            
            <button
              @click="saveDesign"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              💾 Save
            </button>
            
            <button
              @click="loadDesign"
              class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              📁 Load
            </button>
            
            <!-- Export -->
            <div class="border-l border-gray-600 pl-2 ml-2 flex gap-1">
              <button
                @click="exportPNG"
                class="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                title="Export as PNG image"
              >
                🖼️ PNG
              </button>
              
              <button
                @click="exportJPEG"
                class="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                title="Export as JPEG image"
              >
                📷 JPG
              </button>
              
              <button
                @click="exportHighResPNG"
                class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                title="Export as high-resolution PNG (2x)"
              >
                🎯 HD
              </button>
            </div>
            
            <!-- Undo/Redo -->
            <div class="border-l border-gray-600 pl-2 ml-2 flex gap-1">
              <button
                @click="undo"
                :disabled="!objectsStore.canUndo"
                :class="[
                  'px-2 py-1 text-xs rounded transition-colors',
                  objectsStore.canUndo 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                ]"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              
              <button
                @click="redo"
                :disabled="!objectsStore.canRedo"
                :class="[
                  'px-2 py-1 text-xs rounded transition-colors',
                  objectsStore.canRedo 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                ]"
                title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              >
                ↷ Redo
              </button>
            </div>
            
            <!-- Zoom -->
            <div class="border-l border-gray-600 pl-2 ml-2 flex gap-1 items-center">
              <button
                @click="zoomOut"
                class="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                title="Zoom out (Alt+drag to pan)"
              >
                🔍-
              </button>
              
              <span class="text-xs text-gray-300 min-w-[3rem] text-center">
                {{ objectsStore.currentZoom }}%
              </span>
              
              <button
                @click="zoomIn"
                class="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                title="Zoom in (Alt+drag to pan)"
              >
                🔍+
              </button>
              
              <button
                @click="resetZoom"
                class="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ml-1"
                title="Reset zoom to 100%"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        

        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileLoad"
          class="hidden"
        />
      </header>
      
      <div class="flex-1 relative bg-gray-700">

        <VectoriousCanvas />
        

        <div class="absolute bottom-4 left-4 z-10">
          <ShapeToolbar />
        </div>

      </div>
    </div>



    <div class="w-80 xl:w-80 lg:w-72 md:w-64 sm:w-60 border-l border-gray-600 flex-shrink-0">
      <SidePanel />
    </div>


    <!-- Confirmation Modal -->
    <div
      v-if="showNewConfirmation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="cancelNew"
    >
      <div
        class="bg-gray-800 rounded-lg shadow-xl border border-gray-600 p-6 max-w-md mx-4"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-100">Create New Canvas</h3>
        </div>
        
        <p class="text-gray-300 mb-6">
          This will clear your current work and reset everything to a blank canvas. 
          <strong class="text-yellow-400">This action cannot be undone.</strong>
        </p>
        
        <div class="flex gap-3 justify-end">
          <button
            @click="cancelNew"
            class="px-4 py-2 text-sm bg-gray-600 text-gray-200 rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            @click="confirmNew"
            class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Clear Canvas
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.upper-canvas {
  outline: none !important;
}

html, body {
  overflow: hidden;
  background-color: #1f2937;
}
</style>
