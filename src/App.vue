<script setup>
import { onMounted, ref } from 'vue';
import * as fabric from 'fabric';

const canvasEl = ref(null);
let canvas;

onMounted(() => {
  canvas = new fabric.Canvas(canvasEl.value, {
    backgroundColor: '#f0f0f0',
  });
  canvas.setWidth(window.innerWidth);
  canvas.setHeight(window.innerHeight);
});

function addSquare() {
  if (!canvas) return;
  const rect = new fabric.Rect({
    left: 100, top: 100, 
    fill: 'skyblue',
    width: 60, height: 60
  });
  canvas.add(rect);
}

function addCircle() {
  if (!canvas) return;
  const circle = new fabric.Circle({
    left: 200, top: 100,
    fill: 'gold',
    radius: 30
  });
  canvas.add(circle);
}
</script>


<template>

  <div class="relative w-screen h-screen">
    
    <canvas ref="canvasEl" class="absolute top-0 left-0 w-full h-full"></canvas>
    
    <div class="absolute top-4 left-4 z-10 bg-white bg-opacity-80 p-2 rounded shadow">
      <button @click="addSquare" class="px-4 py-2 bg-blue-600 text-white rounded mr-2">Square</button>
      <button @click="addCircle" class="px-4 py-2 bg-green-600 text-white rounded">Circle</button>
    </div>

  </div>
  
</template>