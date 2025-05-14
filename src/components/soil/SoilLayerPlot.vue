<template>
  <div class="soil-layer-plot">
    <Dialog
      v-model:visible="showDialog"
      :header="$t('soil.plotTitle')"
      :modal="true"
      :style="{ width: '80vw' }"
      :closable="true"
    >
      <div class="grid">
        <div class="col-12">
          <div class="plot-container">
            <canvas ref="plotCanvas"></canvas>
          </div>
        </div>
        <div class="col-12">
          <div class="flex justify-content-end gap-2">
            <Button
              :label="$t('soil.exportPlot')"
              icon="pi pi-download"
              @click="handleExport"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useSoilStore } from '@/stores/soil';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

Chart.register(...registerables)

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const soilStore = useSoilStore()
const toast = useToast()
const plotCanvas = ref(null)
const chart = ref(null)

const showDialog = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const soilTypeColors = {
  CLAY: 'rgba(139, 69, 19, 0.7)',    // Brown
  SILT: 'rgba(210, 180, 140, 0.7)',  // Tan
  SAND: 'rgba(238, 214, 175, 0.7)',  // Sand
  GRAVEL: 'rgba(169, 169, 169, 0.7)', // Gray
  ROCK: 'rgba(128, 128, 128, 0.7)'   // Dark Gray
}

const initChart = async () => {
  if (!plotCanvas.value) return;

  try {
    const layers = await soilStore.fetchLayersByProject(props.projectId);
    if (!layers.length) {
      showErrorToast(toast, new Error('No data available'), 'No data available for plotting');
      return;
    }

    const sortedLayers = [...layers].sort((a, b) => a.topDepth - b.topDepth);

    const datasets = sortedLayers.map(layer => ({
      label: layer.name,
      data: [
        { x: 0, y: layer.topDepth },
        { x: 1, y: layer.bottomDepth },
      ],
      backgroundColor: soilTypeColors[layer.soilType] || 'rgba(0, 0, 0, 0.1)',
      borderColor: 'rgba(0, 0, 0, 0.5)',
      borderWidth: 1,
      fill: true,
    }));

    if (chart.value) {
      chart.value.destroy();
    }

    chart.value = new Chart(plotCanvas.value, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'top',
            min: 0,
            max: 1,
            display: false,
          },
          y: {
            reverse: true,
            title: {
              display: true,
              text: 'Depth (m)',
            },
          },
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                return datasets.map((dataset, i) => ({
                  text: dataset.label,
                  fillStyle: dataset.backgroundColor,
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  hidden: !chart.isDatasetVisible(i),
                  index: i,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const layer = sortedLayers[context.datasetIndex];
                return [
                  `Layer: ${layer.name}`,
                  `Soil Type: ${layer.soilType}`,
                  `Top Depth: ${layer.topDepth} m`,
                  `Bottom Depth: ${layer.bottomDepth} m`,
                  `Thickness: ${layer.thickness} m`,
                ];
              },
            },
          },
        },
      },
    });
  } catch (error) {
    showErrorToast(toast, error, 'Failed to generate plot');
  }
};

const handleExport = () => {
  if (!chart.value) return;

  try {
    const canvas = chart.value.canvas;
    const link = document.createElement('a');
    link.download = `soil-layers-${props.projectId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showSuccessToast(toast, 'Plot exported successfully');
  } catch (error) {
    showErrorToast(toast, error, 'Failed to export plot');
  }
};

watch(() => props.visible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      initChart()
    })
  }
})

onMounted(() => {
  if (props.visible) {
    initChart()
  }
})

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<style scoped>
.soil-layer-plot {
  width: 100%;
}

.plot-container {
  position: relative;
  height: 60vh;
  width: 100%;
  margin-bottom: 1rem;
}
</style> 