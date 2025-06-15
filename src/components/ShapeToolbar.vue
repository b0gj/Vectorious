<script setup>
import { useObjectsStore } from '@/stores/objectsStore'

const objectsStore = useObjectsStore()
</script>

<template>
  <div class="bg-gray-800 shadow-xl rounded-lg p-4 border border-gray-600 max-w-md">
    <h3 class="text-sm font-medium text-gray-200 mb-4">Add Shapes</h3>
    
    <!-- Basic Shapes -->
    <div class="grid grid-cols-4 gap-3 mb-3">
      <button
        @click="objectsStore.addRectangle"
        class="flex items-center justify-center px-3 py-3 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Rectangle"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <rect x="3" y="3" width="10" height="10" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addCircle"
        class="flex items-center justify-center px-3 py-3 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Circle"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addTriangle"
        class="flex items-center justify-center px-3 py-3 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Triangle"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <polygon points="8,2 14,12 2,12" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addEllipse"
        class="flex items-center justify-center px-3 py-3 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Ellipse"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>
    </div>

    <!-- Advanced Shapes -->
    <div class="grid grid-cols-4 gap-3 mb-3">
      <button
        @click="objectsStore.addPolygon"
        class="flex items-center justify-center px-3 py-3 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Hexagon"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <polygon points="8,1 13,4.5 13,11.5 8,15 3,11.5 3,4.5" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addStar"
        class="flex items-center justify-center px-3 py-3 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Star"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addArrow"
        class="flex items-center justify-center px-3 py-3 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Arrow"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <polygon points="1,6 1,10 10,10 10,13 15,8 10,3 10,6" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addDiamond"
        class="flex items-center justify-center px-3 py-3 text-xs bg-pink-600 text-white rounded hover:bg-pink-700 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Diamond"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <polygon points="8,1 15,8 8,15 1,8" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>
    </div>

    <!-- Special Shapes -->
    <div class="grid grid-cols-4 gap-3">
      <button
        @click="objectsStore.addLine"
        class="flex items-center justify-center px-3 py-3 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Line"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addHeart"
        class="flex items-center justify-center px-3 py-3 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Heart"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 14s6-5.686 6-10A4 4 0 0 0 8 1.314 4 4 0 0 0 2 4c0 4.314 6 10 6 10z" stroke="currentColor" fill="none" stroke-width="1"/>
        </svg>
      </button>

      <button
        @click="objectsStore.addQuarteredCircle"
        class="flex items-center justify-center px-3 py-3 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        title="Add Quartered Circle"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" stroke-width="1"/>
          <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1"/>
          <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>

      <div class="flex items-center justify-center px-3 py-3 text-xs bg-gray-500 text-gray-400 rounded cursor-not-allowed opacity-50" title="Custom shape slot">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      </div>
    </div>
  </div>
</template> 