import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fabric from 'fabric'

export const useObjectsStore = defineStore('objects', () => {
  const canvas = ref(null)
  
  // fabric selected objects
  const selectedObjects = ref([])
  
  const allObjects = ref([])

  const clipboard = ref([])

  const lastClickPosition = ref({ x: 100, y: 100 })

  const currentZoom = ref(100)

  const canvasBackgroundColor = ref('#525252')

  const canvasTitle = ref('Vectorious Design')

  const undoStack = ref([])
  const redoStack = ref([])
  const maxUndoSteps = 50 
  let isUndoRedoOperation = false // prevent saving during undo/redo
  let hasUserMadeChanges = false

  // selection
  const hasSelection = computed(() => selectedObjects.value.length > 0)
  const isSingleSelection = computed(() => selectedObjects.value.length === 1)
  const isMultiSelection = computed(() => selectedObjects.value.length > 1)

  const hasClipboard = computed(() => clipboard.value.length > 0)

  const canUndo = computed(() => undoStack.value.length > 0 && hasUserMadeChanges)
  const canRedo = computed(() => redoStack.value.length > 0)

  function roundToTwo(num) { // helper function
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  // common properties of selected objects
  const commonProperties = computed(() => {
    if (!hasSelection.value) return {}
    
    if (isSingleSelection.value) { // single selection
      const obj = selectedObjects.value[0]
      return {
        left: roundToTwo(obj.left),
        top: roundToTwo(obj.top),
        scaleX: roundToTwo(obj.scaleX),
        scaleY: roundToTwo(obj.scaleY),
        angle: roundToTwo(obj.angle),
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: roundToTwo(obj.strokeWidth),
        opacity: roundToTwo(obj.opacity)
      }
    } else { // multi-selection
      const activeObject = canvas.value ? canvas.value.getActiveObject() : null
      
      const first = selectedObjects.value[0]
      const props = { // group position
        left: activeObject && (activeObject.type === 'activeSelection' || activeObject.type === 'activeselection') 
              ? roundToTwo(activeObject.left) 
              : roundToTwo(first.left),
        top: activeObject && (activeObject.type === 'activeSelection' || activeObject.type === 'activeselection') 
             ? roundToTwo(activeObject.top) 
             : roundToTwo(first.top),
        scaleX: roundToTwo(first.scaleX),
        scaleY: roundToTwo(first.scaleY),
        angle: roundToTwo(first.angle),
        fill: first.fill,
        stroke: first.stroke,
        strokeWidth: roundToTwo(first.strokeWidth),
        opacity: roundToTwo(first.opacity)
      }

      selectedObjects.value.forEach(obj => { // check for common values
        Object.keys(props).forEach(key => {
          if (key === 'left' || key === 'top') return
          
          if (key === 'scaleX' || key === 'scaleY' || key === 'angle' || key === 'strokeWidth' || key === 'opacity') {
            if (Math.abs(props[key] - roundToTwo(obj[key])) > 0.01) {
              props[key] = null // mixed values
            }
          } else if (props[key] !== obj[key]) {
            props[key] = null // mixed values
          }
        })
      })

      return props
    }
  })

  
  function setCanvas(canvasInstance) {
    canvas.value = canvasInstance
    setupCanvasEvents()
    
    // init zoom tracking
    updateZoomTracking()
    
    if (canvas.value.backgroundColor) {
      canvasBackgroundColor.value = canvas.value.backgroundColor
    }
    
    setTimeout(() => {
      saveState() // save initial state(undo/redo)
    }, 100)
    
    // if (typeof window !== 'undefined') {
    //   window.debugVectoriousSelection = debugSelection
    // } // debugging stuff
  }

  function setupCanvasEvents() {
    if (!canvas.value) return

    canvas.value.on('selection:created', updateSelection)
    canvas.value.on('selection:updated', updateSelection) 
    canvas.value.on('selection:cleared', clearSelection)
    
    canvas.value.on('before:selection:cleared', () => {
      // delay to let other events
      setTimeout(verifySelection, 50)
    })
    
    canvas.value.on('object:modified', handleObjectModified)
    canvas.value.on('object:added', updateObjectsList)
    canvas.value.on('object:removed', updateObjectsList)

    // save state(undo/redo)
    canvas.value.on('mouse:down', saveStateBeforeInteraction)
    canvas.value.on('mouse:up', resetInteractionFlag)

    // paste coords
    canvas.value.on('mouse:down', (e) => {
      if (e.pointer) {
        lastClickPosition.value = {
          x: e.pointer.x,
          y: e.pointer.y
        }
      }
    })

    // selection oververification
    canvas.value.on('mouse:up', () => {
      setTimeout(verifySelection, 100)
    })

    setInterval(verifySelection, 2000)
  }

  function updateSelection(e) {
    if (e.target) {
      if (e.target.type === 'activeSelection' || e.target.type === 'activeselection') { // multi-selection
        const objects = e.target._objects || e.target.getObjects() || []
        selectedObjects.value = objects
      } else { // single selection
        selectedObjects.value = [e.target]
      }
    } else if (e.selected && e.selected.length > 0) { // fallback
      selectedObjects.value = e.selected
    } else { // no selection
      selectedObjects.value = []
    }
    
    setTimeout(verifySelection, 100)
  }

  function clearSelection() {
    selectedObjects.value = []
  }

  function syncSelectionState() {
    if (!canvas.value) return
    
    const activeObject = canvas.value.getActiveObject()
    
    if (!activeObject) {
      selectedObjects.value = []
    } else if (activeObject.type === 'activeSelection' || activeObject.type === 'activeselection') { // multi-selection
      const objects = activeObject._objects || activeObject.getObjects() || []
      selectedObjects.value = objects
    } else { // single selection
      selectedObjects.value = [activeObject]
    }
  }

  function verifySelection() {
    if (!canvas.value) return
    
    const currentSelection = selectedObjects.value.slice()
    syncSelectionState()
    
    const newSelection = selectedObjects.value
    if (currentSelection.length !== newSelection.length || 
        !currentSelection.every((obj, i) => obj === newSelection[i])) {
    }
  }

  // function debugSelection() {
  //   if (!canvas.value) {
  //     console.log('❌ No canvas')
  //     return
  //   }
    
  //   const activeObject = canvas.value.getActiveObject()
  //   console.log('🔍 SELECTION DEBUG:')
  //   console.log('📊 Store selectedObjects count:', selectedObjects.value.length)
  //   console.log('📊 Store selectedObjects types:', selectedObjects.value.map(obj => obj?.type))
  //   console.log('🎯 Canvas activeObject:', activeObject ? activeObject.type : 'none')
    
  //   if (activeObject && (activeObject.type === 'activeSelection' || activeObject.type === 'activeselection')) {
  //     const objects = activeObject._objects || activeObject.getObjects() || []
  //     console.log('🎯 ActiveSelection contains:', objects.length, 'objects')
  //     console.log('🎯 ActiveSelection object types:', objects.map(obj => obj.type))
  //   }
    
  //   console.log('✅ Store hasSelection:', hasSelection.value)
  //   console.log('✅ Store isMultiSelection:', isMultiSelection.value)
    
  //   const beforeSync = selectedObjects.value.slice()
  //   syncSelectionState()
  //   const afterSync = selectedObjects.value
    
  //   if (beforeSync.length !== afterSync.length) { // force sync and see if anything changed
  //     console.log('🔧 Selection corrected by manual sync:', beforeSync.length, '->', afterSync.length)
  //   } else {
  //     console.log('✅ Selection is consistent')
  //   }
  // }

  function handleObjectModified() { // trigger reactivity update 
    selectedObjects.value = [...selectedObjects.value]
  }

  let hasInteractionStateSaved = false
  function saveStateBeforeInteraction(e) { // save state before interaction
    if (e.target && !hasInteractionStateSaved && !isUndoRedoOperation) {
      saveState()
      hasInteractionStateSaved = true
      // console.log('State saved before interaction')
    }
  }

  function resetInteractionFlag() { // reset when mouse is released
    if (hasInteractionStateSaved) {
      hasInteractionStateSaved = false
      // console.log('Interaction session ended')
    }
  }

  function updateObjectsList() {
    if (canvas.value) {
      allObjects.value = canvas.value.getObjects()
    }
  }

  // Shapes
  function addRectangle() {
    if (!canvas.value) return
    
    saveState()
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3498db',
      stroke: '#2c3e50',
      strokeWidth: 2
    })
    
    rect.name = generateUniqueName('Rectangle', 'rect')
    
    canvas.value.add(rect)
    canvas.value.setActiveObject(rect)
    canvas.value.renderAll()
  }

  function addCircle() {
    if (!canvas.value) return
    
    saveState()
    
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: '#e74c3c',
      stroke: '#c0392b',
      strokeWidth: 2
    })
    
    circle.name = generateUniqueName('Circle', 'circle')
    
    canvas.value.add(circle)
    canvas.value.setActiveObject(circle)
    canvas.value.renderAll()
  }

  function addTriangle() {
    if (!canvas.value) return
    
    saveState()
    
    const triangle = new fabric.Triangle({
      left: 200,
      top: 200,
      width: 100,
      height: 100,
      fill: '#f39c12',
      stroke: '#e67e22',
      strokeWidth: 2
    })
    
    triangle.name = generateUniqueName('Triangle', 'triangle')
    
    canvas.value.add(triangle)
    canvas.value.setActiveObject(triangle)
    canvas.value.renderAll()
  }

  function addLine() {
    if (!canvas.value) return
    
    saveState()
    
    const line = new fabric.Line([50, 100, 200, 100], {
      left: 250,
      top: 250,
      stroke: '#9b59b6',
      strokeWidth: 5
    })
    
    line.name = generateUniqueName('Line', 'line')
    
    canvas.value.add(line)
    canvas.value.setActiveObject(line)
    canvas.value.renderAll()
  }

  function addPolygon() {
    if (!canvas.value) return
    
    saveState()
    
    const points = []
    const sides = 6
    const radius = 50
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      })
    }
    
    const polygon = new fabric.Polygon(points, {
      left: 300,
      top: 100,
      fill: '#16a085',
      stroke: '#0f6b5c',
      strokeWidth: 2
    })
    
    polygon.name = generateUniqueName('Hexagon', 'polygon')
    
    canvas.value.add(polygon)
    canvas.value.setActiveObject(polygon)
    canvas.value.renderAll()
  }

  function addStar() {
    if (!canvas.value) return
    
    saveState()
    
    const points = []
    const spikes = 5
    const outerRadius = 50
    const innerRadius = 20
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      points.push({
        x: radius * Math.cos(angle - Math.PI / 2),
        y: radius * Math.sin(angle - Math.PI / 2)
      })
    }
    
    const star = new fabric.Polygon(points, {
      left: 350,
      top: 150,
      fill: '#f1c40f',
      stroke: '#d4ac0d',
      strokeWidth: 2
    })
    
    star.name = generateUniqueName('Star', 'polygon')
    
    canvas.value.add(star)
    canvas.value.setActiveObject(star)
    canvas.value.renderAll()
  }

  function addArrow() {
    if (!canvas.value) return
    
    saveState()
    
    const arrowPoints = [
      { x: 40, y: 0 },
      { x: 20, y: -15 },
      { x: 20, y: -8 },
      { x: -40, y: -8 },
      { x: -40, y: 8 },
      { x: 20, y: 8 },
      { x: 20, y: 15 }
    ]
    
    const arrow = new fabric.Polygon(arrowPoints, {
      left: 400,
      top: 200,
      fill: '#e67e22',
      stroke: '#d35400',
      strokeWidth: 2
    })
    
    arrow.name = generateUniqueName('Arrow', 'polygon')
    
    canvas.value.add(arrow)
    canvas.value.setActiveObject(arrow)
    canvas.value.renderAll()
  }

  function addEllipse() {
    if (!canvas.value) return
    
    saveState()
    
    const ellipse = new fabric.Ellipse({
      left: 100,
      top: 300,
      rx: 60,
      ry: 30,
      fill: '#8e44ad',
      stroke: '#6c3483',
      strokeWidth: 2
    })
    
    ellipse.name = generateUniqueName('Ellipse', 'ellipse')
    
    canvas.value.add(ellipse)
    canvas.value.setActiveObject(ellipse)
    canvas.value.renderAll()
  }

  function addDiamond() {
    if (!canvas.value) return
    
    saveState()
    
    const diamondPoints = [
      { x: 0, y: -40 },
      { x: 40, y: 0 },
      { x: 0, y: 40 },
      { x: -40, y: 0 }
    ]
    
    const diamond = new fabric.Polygon(diamondPoints, {
      left: 200,
      top: 300,
      fill: '#e91e63',
      stroke: '#ad1457',
      strokeWidth: 2
    })
    
    diamond.name = generateUniqueName('Diamond', 'polygon')
    
    canvas.value.add(diamond)
    canvas.value.setActiveObject(diamond)
    canvas.value.renderAll()
  }

  function addHeart() {
    if (!canvas.value) return
    
    saveState()
    
    const heartPath = 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z'
    
    const heart = new fabric.Path(heartPath, {
      left: 300,
      top: 300,
      fill: '#e74c3c',
      stroke: '#c0392b',
      strokeWidth: 1,
      scaleX: 3,
      scaleY: 3
    })
    
    heart.name = generateUniqueName('Heart', 'path')
    
    canvas.value.add(heart)
    canvas.value.setActiveObject(heart)
    canvas.value.renderAll()
  }

  function addQuarteredCircle() {
    if (!canvas.value) return
    
    saveState()
    
    const radius = 50
    const centerX = 0
    const centerY = 0
    
    const circle = new fabric.Circle({
      left: centerX - radius,
      top: centerY - radius,
      radius: radius,
      fill: 'transparent',
      stroke: '#2c3e50',
      strokeWidth: 2,
      originX: 'left',
      originY: 'top'
    })
    
    const horizontalLine = new fabric.Line([centerX - radius, centerY, centerX + radius, centerY], {
      stroke: '#2c3e50',
      strokeWidth: 2,
      originX: 'left',
      originY: 'top'
    })
    
    const verticalLine = new fabric.Line([centerX, centerY - radius, centerX, centerY + radius], {
      stroke: '#2c3e50',
      strokeWidth: 2,
      originX: 'left',
      originY: 'top'
    })
    
    const quarteredCircle = new fabric.Group([circle, horizontalLine, verticalLine], {
      left: 400,
      top: 300,
      selectable: true
    })
    
    quarteredCircle.name = generateUniqueName('Quartered Circle', 'group')
    
    canvas.value.add(quarteredCircle)
    canvas.value.setActiveObject(quarteredCircle)
    canvas.value.renderAll()
  }

  function updateProperty(property, value) {
    if (!hasSelection.value) return
    
    if ((property === 'left' || property === 'top') && isMultiSelection.value) { // multi-selection coords
      updateMultiSelectionPosition(property, value)
      return
    }
    
    selectedObjects.value.forEach((obj, index) => { 
      if (obj && obj.set) {
        obj.set(property, value)
        obj.setCoords()
      } else {
        console.warn('Invalid object at index:', index, obj)
      }
    })
    
    canvas.value.renderAll()
    
    const activeObject = canvas.value.getActiveObject()
    if (activeObject && (activeObject.type === 'activeSelection' || activeObject.type === 'activeselection')) {
      activeObject.setCoords()
    }
    
    selectedObjects.value = Array.isArray(selectedObjects.value) ? [...selectedObjects.value] : [] // trigger reactivity
  }

  function updateMultiSelectionPosition(property, newValue) {
    if (!isMultiSelection.value) return
    
    const activeObject = canvas.value.getActiveObject()
    if (!activeObject || (activeObject.type !== 'activeSelection' && activeObject.type !== 'activeselection')) return
    
    activeObject.set(property, newValue)
    activeObject.setCoords()
    
    canvas.value.renderAll()
    
    selectedObjects.value = Array.isArray(selectedObjects.value) ? [...selectedObjects.value] : []
  }

  function deleteSelected() {
    if (!hasSelection.value) return
    
    saveState()
    
    selectedObjects.value.forEach(obj => {
      canvas.value.remove(obj)
    })
    
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
  }

  function selectAll() { // jumping issue, not usable
    if (!canvas.value) return
    
    const allObjects = canvas.value.getObjects()
    
    if (allObjects.length === 0) {
      return
    }
    
    if (allObjects.length === 1) {
      canvas.value.setActiveObject(allObjects[0])
      canvas.value.renderAll()
    } else {
      // ...
    }
  }

  async function copySelected() {
    if (!hasSelection.value) return
    
    if (!selectedObjects.value || !Array.isArray(selectedObjects.value) || selectedObjects.value.length === 0) {
      return
    }
    
    clipboard.value = []
    
    try { // preserve relative positions
      let minLeft = Infinity
      let minTop = Infinity
      
      selectedObjects.value.forEach(obj => {
        if (obj) {
          minLeft = Math.min(minLeft, obj.left)
          minTop = Math.min(minTop, obj.top)
        }
      })
      
      const clonePromises = selectedObjects.value.map(async (obj) => {
        if (obj && typeof obj.clone === 'function') {
          try {
            const cloned = await obj.clone()
            
            const relativeOffset = {
              left: obj.left - minLeft,
              top: obj.top - minTop
            }
            
            const originalName = obj.name || getDefaultName(obj.type || 'unknown', 0)
            
            cloned._relativeOffset = relativeOffset
            cloned._originalName = originalName
            
            return cloned
          } catch (error) {
            console.warn('Failed to clone object:', obj, error)
            return null
          }
        } else {
          console.warn('Object does not have clone method:', obj)
          return null
        }
      })
      
      const clonedObjects = await Promise.all(clonePromises)
      
      clipboard.value = clonedObjects.filter(obj => obj !== null && obj !== undefined) // filter out failed clones
      
    } catch (error) {
      console.error('Error during copy operation:', error)
      clipboard.value = []
    }
  }

  async function cutSelected() {
    if (!hasSelection.value) return
    
    await copySelected()
    
    if (clipboard.value.length > 0) {
      deleteSelected()
    }
  }

  function getDefaultName(type, index) {
    const typeNames = {
      'rect': 'Rectangle',
      'circle': 'Circle', 
      'triangle': 'Triangle',
      'line': 'Line',
      'polygon': 'Hexagon',
      'ellipse': 'Ellipse',
      'group': 'Group',
      'path': 'Path'
    }
    return `${typeNames[type] || 'Object'} ${index + 1}`
  }

  function generateUniqueName(baseName, objectType, isCopy = false) {
    if (!canvas.value) return baseName
    
    const existingObjects = canvas.value.getObjects()
    
    const sameTypeObjects = existingObjects.filter(obj => obj.type === objectType)
    const sameTypeNames = sameTypeObjects.map(obj => obj.name).filter(name => name)
    
    const baseNameClean = baseName.replace(/\s*\(\d+\)$/, '').replace(/\s*Copy\s*(\(\d+\))?$/, '').trim()
    
    if (isCopy) {
      if (sameTypeNames.includes(baseName)) {
        const copyBaseName = `${baseName} Copy`
        
        const copyPattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} Copy(?:\\s*\\((\\d+)\\))?$`)
        const copyNames = sameTypeNames.filter(name => copyPattern.test(name))
        
        if (copyNames.length === 0) {
          return copyBaseName
        } else {
          let highestCopyCounter = 1
          copyNames.forEach(name => {
            const match = name.match(copyPattern)
            if (match && match[1]) {
              highestCopyCounter = Math.max(highestCopyCounter, parseInt(match[1]))
            }
          })
          
          return `${baseName} Copy (${highestCopyCounter + 1})`
        }
      } else {
        return baseName
      }
    } else {
      const nonCopyNames = sameTypeNames.filter(name => !name.includes(' Copy'))
      
      const matchingNames = nonCopyNames.filter(name => 
        name === baseNameClean || name.match(new RegExp(`^${baseNameClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(\\d+\\)$`))
      )
      
      if (matchingNames.length === 0) {
        return baseNameClean
      }
      
      let highestCounter = 0
      
      matchingNames.forEach(name => {
        if (name === baseNameClean) {
          highestCounter = Math.max(highestCounter, 1)
        } else {
          const match = name.match(/\((\d+)\)$/)
          if (match) {
            highestCounter = Math.max(highestCounter, parseInt(match[1]))
          }
        }
      })
      
      const nextCounter = nonCopyNames.includes(baseNameClean) ? highestCounter + 1 : 1
      
      return nextCounter === 1 ? baseNameClean : `${baseNameClean} (${nextCounter})`
    }
  }

  async function pasteFromClipboard() {
    if (clipboard.value.length === 0) return
    
    saveState()
    
    const newTopLeft = {
      x: lastClickPosition.value.x,
      y: lastClickPosition.value.y
    }
    
    try {
      const pastePromises = clipboard.value.map(async (obj) => {
        if (obj && typeof obj.clone === 'function') {
          try {
            const cloned = await obj.clone()
            
            if (obj._relativeOffset) {
              cloned.left = newTopLeft.x + obj._relativeOffset.left
              cloned.top = newTopLeft.y + obj._relativeOffset.top
            } else {
              cloned.left = newTopLeft.x
              cloned.top = newTopLeft.y
            }
            
            if (obj._originalName) {
              cloned.name = generateUniqueName(obj._originalName, obj.type, true)
            } else {
              cloned.name = generateUniqueName(getDefaultName(cloned.type || 'unknown', 0), cloned.type, true)
            }
            
            cloned.setCoords()
            return cloned
          } catch (error) {
            console.warn('Failed to clone object for paste:', obj, error)
            return null
          }
        } else {
          console.warn('Object does not have clone method:', obj)
          return null
        }
      })
      
      const newObjects = await Promise.all(pastePromises)
      
      const validObjects = newObjects.filter(obj => obj !== null && obj !== undefined)
      
      if (validObjects.length > 0) {
        validObjects.forEach(obj => canvas.value.add(obj))
        
        if (validObjects.length === 1) {
          canvas.value.setActiveObject(validObjects[0])
        } else if (validObjects.length > 1) {
          const activeSelection = new fabric.ActiveSelection(validObjects, {
            canvas: canvas.value
          })
          canvas.value.setActiveObject(activeSelection)
        }
        
        canvas.value.renderAll()
      }
      
    } catch (error) {
      console.error('Error during paste operation:', error)
    }
  }

  function exportToJSON() {
    if (!canvas.value) return null
    
    try {
      const json = canvas.value.toJSON(['name'])
      
      json.canvasTitle = canvasTitle.value
      
      return json
    } catch (error) {
      console.error('Failed to export canvas:', error)
      return null
    }
  }

  async function importFromJSON(jsonData) {
    if (!canvas.value || !jsonData) return false
    
    try {
      canvas.value.clear()
      
      await canvas.value.loadFromJSON(jsonData)
      
      if (jsonData.backgroundImage || jsonData.backgroundColor) {
        canvasBackgroundColor.value = jsonData.backgroundColor || '#525252'
      }
      
      if (jsonData.canvasTitle) {
        canvasTitle.value = jsonData.canvasTitle
      } else {
        canvasTitle.value = 'Vectorious Design'
      }
      
      canvas.value.renderAll()
      
      return true
    } catch (error) {
      console.error('Failed to import canvas:', error)
      return false
    }
  }

  function saveToFile(filename) {
    const jsonData = exportToJSON()
    if (!jsonData) return
    
    const finalFilename = filename || `${canvasTitle.value.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    
    try {
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = finalFilename
      a.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  function loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== 'application/json') {
        reject(new Error('Please select a valid JSON file'))
        return
      }
      
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          const success = await importFromJSON(jsonData)
          
          if (success) {
            console.log(`Canvas loaded from ${file.name}`)
            resolve(true)
          } else {
            reject(new Error('Failed to import canvas data'))
          }
        } catch (error) {
          reject(new Error('Invalid JSON file format'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  }

  function zoomIn() {
    if (!canvas.value) return
    
    const currentZoomValue = canvas.value.getZoom()
    const newZoom = Math.min(currentZoomValue * 1.2, 5) // Max 5x
    canvas.value.setZoom(newZoom)
    canvas.value.renderAll()
    updateZoomTracking()
  }

  function zoomOut() {
    if (!canvas.value) return
    
    const currentZoomValue = canvas.value.getZoom()
    const newZoom = Math.max(currentZoomValue / 1.2, 0.1) // Min 0.1x
    canvas.value.setZoom(newZoom)
    canvas.value.renderAll()
    updateZoomTracking()
  }

  function resetZoom() {
    if (!canvas.value) return
    
    canvas.value.setZoom(1)
    canvas.value.renderAll()
    updateZoomTracking()
  }

  function updateZoomTracking() {
    if (canvas.value) {
      currentZoom.value = Math.round(canvas.value.getZoom() * 100)
    }
  }

  function updateCanvasBackground(color) {
    if (canvas.value) {
      saveState()
      
      canvas.value.backgroundColor = color
      canvas.value.renderAll()
      canvasBackgroundColor.value = color
    }
  }

  function updateCanvasTitle(title) {
    canvasTitle.value = title || 'Vectorious Design'
  }

  function clearCanvas() {
    if (!canvas.value) return
    
    try {
      canvas.value.clear()
      
      canvasTitle.value = 'Vectorious Design'
      canvasBackgroundColor.value = '#525252'
      canvas.value.backgroundColor = '#525252'
      
      selectedObjects.value = []
      allObjects.value = []
      clipboard.value = []
      
      undoStack.value = []
      redoStack.value = []
      hasUserMadeChanges = false
      isUndoRedoOperation = false
      hasInteractionStateSaved = false
      
      canvas.value.setZoom(1)
      updateZoomTracking()
      
      canvas.value.viewportTransform = [1, 0, 0, 1, 0, 0] // reset pan
      
      canvas.value.renderAll()
      
      setTimeout(() => {
        saveState()
      }, 100)
      
    } catch (error) {
      console.error('Failed to clear canvas:', error)
    }
  }

  function saveState() {
    if (isUndoRedoOperation || !canvas.value) return
    
    try {
      const state = {
        canvas: canvas.value.toJSON(['name']),
        title: canvasTitle.value,
        backgroundColor: canvasBackgroundColor.value
      }
      
      undoStack.value.push(state)
      
      if (undoStack.value.length > 1) { // prevent init undo button show
        hasUserMadeChanges = true
      }
      
      if (undoStack.value.length > maxUndoSteps) { // limit stack size
        undoStack.value.shift()
      }
      
      redoStack.value = []
      
    } catch (error) {
      console.error('Failed to save state:', error)
    }
  }

  async function restoreState(state) {
    if (!canvas.value || !state) return false
    
    try {
      isUndoRedoOperation = true
      
      canvas.value.clear()
      
      await canvas.value.loadFromJSON(state.canvas)
      
      canvasTitle.value = state.title || 'Vectorious Design'
      canvasBackgroundColor.value = state.backgroundColor || '#525252'
      canvas.value.backgroundColor = canvasBackgroundColor.value
      
      canvas.value.renderAll()
      
      isUndoRedoOperation = false
      return true
    } catch (error) {
      console.error('Failed to restore state:', error)
      isUndoRedoOperation = false
      return false
    }
  }

  async function undo() {
    if (!canUndo.value) return
    
    try {
      const currentState = {
        canvas: canvas.value.toJSON(['name']),
        title: canvasTitle.value,
        backgroundColor: canvasBackgroundColor.value
      }
      redoStack.value.push(currentState)
      
      const previousState = undoStack.value.pop()
      
      if (undoStack.value.length <= 1) {
        hasUserMadeChanges = false
      }
      
      await restoreState(previousState)
      
      console.log(`Undo performed. Undo: ${undoStack.value.length}, Redo: ${redoStack.value.length}, User changes: ${hasUserMadeChanges}`)
    } catch (error) {
      console.error('Undo failed:', error)
    }
  }

  async function redo() {
    if (!canRedo.value) return
    
    try {
      const currentState = {
        canvas: canvas.value.toJSON(['name']),
        title: canvasTitle.value,
        backgroundColor: canvasBackgroundColor.value
      }
      undoStack.value.push(currentState)
      
      const nextState = redoStack.value.pop()
      
      hasUserMadeChanges = true
      
      await restoreState(nextState)
      
    } catch (error) {
      console.error('Redo failed:', error)
    }
  }

  function exportToPNG(filename, quality = 1.0) {
    if (!canvas.value) return
    
    const finalFilename = filename || `${canvasTitle.value.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
    
    try {
      const dataURL = canvas.value.toDataURL({
        format: 'png',
        quality: quality,
        multiplier: 1 // res multiplier
      })
      
      const link = document.createElement('a')
      link.href = dataURL
      link.download = finalFilename
      link.click()
      
    } catch (error) {
      console.error('Failed to export PNG:', error)
    }
  }

  function exportToJPEG(filename, quality = 0.8) {
    if (!canvas.value) return
    
    const finalFilename = filename || `${canvasTitle.value.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
    
    try {
      const dataURL = canvas.value.toDataURL({
        format: 'jpeg',
        quality: quality,
        multiplier: 1
      })
      
      const link = document.createElement('a')
      link.href = dataURL
      link.download = finalFilename
      link.click()
      
    } catch (error) {
      console.error('Failed to export JPEG:', error)
    }
  }

  function exportToHighResPNG(filename) {
    if (!canvas.value) return
    
    const finalFilename = filename || `${canvasTitle.value.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-hires.png`
    
    try {
      const dataURL = canvas.value.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2 // 2x res
      })
      
      const link = document.createElement('a')
      link.href = dataURL
      link.download = finalFilename
      link.click()
      
    } catch (error) {
      console.error('Failed to export high-res PNG:', error)
    }
  }

  return {
    // State
    canvas,
    selectedObjects,
    allObjects,
    
    // Computed
    hasSelection,
    isSingleSelection,
    isMultiSelection,
    commonProperties,
    hasClipboard,
    currentZoom,
    canvasBackgroundColor,
    canvasTitle,
    canUndo,
    canRedo,
    
    // Actions
    setCanvas,
    addRectangle,
    addCircle,
    addTriangle,
    addLine,
    addPolygon,
    addStar,
    addArrow,
    addEllipse,
    addDiamond,
    addHeart,
    addQuarteredCircle,
    updateProperty,
    deleteSelected,
    copySelected,
    cutSelected,
    pasteFromClipboard,
    syncSelectionState,
    // debugSelection,
    getDefaultName,
    exportToJSON,
    importFromJSON,
    saveToFile,
    loadFromFile,
    zoomIn,
    zoomOut,
    resetZoom,
    updateZoomTracking,
    updateCanvasBackground,
    updateCanvasTitle,
    clearCanvas,
    saveState,
    undo,
    redo,
    exportToPNG,
    exportToJPEG,
    exportToHighResPNG
  }
}) 