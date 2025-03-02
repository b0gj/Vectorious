<script setup>
import { onMounted, ref } from "vue";
import * as fabric from "fabric";

const canvasEl = ref(null);
let canvas;

onMounted(() => {
  const parentDiv = canvasEl.value.parentNode;
  const { clientWidth, clientHeight } = parentDiv;

  canvas = new fabric.Canvas(canvasEl.value, {
    backgroundColor: "#f0f0f0",
    width: clientWidth,
    height: clientHeight,
  });

  canvas.renderAll();

  const resizeObserver = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = parentDiv;
    canvas.setDimensions({
      width: clientWidth,
      height: clientHeight,
    });
    canvas.renderAll();
  });

  resizeObserver.observe(parentDiv);

  canvas.on("object:modified", (e) => {
    const modifiedObject = e.target;
    console.log("Object modified:", modifiedObject);
  });
});

function addSquare() {
  if (!canvas) return;
  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: "skyblue",
    width: 60,
    height: 60,
  });
  canvas.add(rect);
}

function addCircle() {
  if (!canvas) return;
  const circle = new fabric.Circle({
    left: 200,
    top: 100,
    fill: "gold",
    radius: 30,
  });
  canvas.add(circle);
}
</script>

<template>
  <div class="relative flex h-screen w-screen flex-row">
    <div class="h-full w-5/6 bg-amber-600">
      <canvas ref="canvasEl" class="h-full w-full"></canvas>
    </div>

    <div class="h-full w-1/6 bg-blue-600"></div>

    <div
      class="bg-opacity-80 absolute top-4 left-4 z-10 rounded bg-white p-2 shadow"
    >
      <button
        @click="addSquare"
        class="mr-2 rounded bg-sky-400 px-4 py-2 text-white"
      >
        Square
      </button>
      <button
        @click="addCircle"
        class="rounded bg-sky-400 px-4 py-2 text-white"
      >
        Circle
      </button>
    </div>
  </div>
</template>
