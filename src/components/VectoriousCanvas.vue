<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import * as fabric from 'fabric'
import { useObjectsStore } from '@/stores/objectsStore'

const canvasEl = ref(null)
const objectsStore = useObjectsStore()

let canvas = null
let resizeObserver = null

onMounted(() => {
  initializeCanvas()
  setupResize()
  setupKeyboardShortcuts()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (canvas) {
    canvas.dispose()
  }
  document.removeEventListener('keydown', handleKeyDown)
})

function initializeCanvas() {
  const parentDiv = canvasEl.value.parentNode
  const { clientWidth, clientHeight } = parentDiv

  canvas = new fabric.Canvas(canvasEl.value, {
    backgroundColor: '#525252',
    width: clientWidth,
    height: clientHeight,
    selection: true,
    preserveObjectStacking: true,
    allowTouchScrolling: true
  })

  let isPanning = false
  let lastPosX = 0
  let lastPosY = 0

  canvas.on('mouse:down', function(opt) {
    const evt = opt.e
    if (evt.altKey === true) {
      isPanning = true
      canvas.selection = false
      lastPosX = evt.clientX
      lastPosY = evt.clientY
      canvas.setCursor('grab')
    }
  })

  canvas.on('mouse:move', function(opt) {
    if (isPanning) {
      const evt = opt.e
      const vpt = canvas.viewportTransform
      vpt[4] += evt.clientX - lastPosX
      vpt[5] += evt.clientY - lastPosY
      canvas.requestRenderAll()
      lastPosX = evt.clientX
      lastPosY = evt.clientY
      canvas.setCursor('grabbing')
    }
  })

  canvas.on('mouse:up', function(opt) {
    if (isPanning) {
      canvas.setViewportTransform(canvas.viewportTransform)
      isPanning = false
      canvas.selection = true
      canvas.setCursor('default')
    }
  })

  canvas.on('mouse:wheel', function(opt) {
    const evt = opt.e
    if (evt.altKey) {
      evt.preventDefault()
      evt.stopPropagation()
      
      const delta = evt.deltaY
      const currentZoom = canvas.getZoom()
      let newZoom
      
      if (delta < 0) {
        newZoom = Math.min(currentZoom * 1.1, 5)
      } else {
        newZoom = Math.max(currentZoom / 1.1, 0.1)
      }
      
      const pointer = canvas.getPointer(evt)
      canvas.zoomToPoint({ x: pointer.x, y: pointer.y }, newZoom)
      
      canvas.renderAll()
      objectsStore.updateZoomTracking()
    }
  })

  objectsStore.setCanvas(canvas)
  canvas.renderAll()
}

function setupResize() {
  const parentDiv = canvasEl.value.parentNode
  
  resizeObserver = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = parentDiv
    canvas.setDimensions({
      width: clientWidth,
      height: clientHeight
    })
    canvas.renderAll()
  })

  resizeObserver.observe(parentDiv)
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', handleKeyDown)
}

function handleKeyDown(e) {
  const activeElement = document.activeElement
  const isInputFocused = activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.isContentEditable
  )
  
  if (isInputFocused) return
  
  // Copy: Ctrl+C
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault()
    objectsStore.copySelected()
  }
  
  // Cut: Ctrl+X
  if (e.ctrlKey && e.key === 'x') {
    e.preventDefault()
    objectsStore.cutSelected()
  }
  
  // Paste: Ctrl+V
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault()
    objectsStore.pasteFromClipboard()
  }
  
  // Select All: Ctrl+A - We don't talk about Ctrl+A
  // if (e.ctrlKey && e.key === 'a') {
  //   e.preventDefault()
  //   objectsStore.selectAll()
  // }
  
  // Delete: Delete key
  if (e.key === 'Delete') {
    e.preventDefault()
    objectsStore.deleteSelected()
  }
}
</script>

<template>
  <div class="h-full w-full overflow-hidden">
    <canvas 
      ref="canvasEl" 
      class="block border border-gray-600"
    />
  </div>
</template> 