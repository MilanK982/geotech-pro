<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="$t('cpt.plotData')"
    :modal="true"
    :style="{ width: '80vw' }"
  >
    <div class="plot-container">
      <div v-if="loading" class="flex justify-content-center">
        <ProgressSpinner />
      </div>
      <div v-else-if="error" class="p-error">
        {{ error }}
      </div>
      <div v-else ref="plotContainer" class="plot"></div>
    </div>

    <template #footer>
      <Button
        :label="$t('common.close')"
        icon="pi pi-times"
        class="p-button-text"
        @click="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCptStore } from '@/stores/cpt.store';
import { useToast } from 'primevue/usetoast';
import { showErrorToast } from '@/utils/toast';
import Plot from 'plotly.js-dist';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  testId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:visible']);

const cptStore = useCptStore();
const toast = useToast();
const plotContainer = ref(null);
const loading = ref(false);
const error = ref(null);

const loadAndPlotData = async () => {
  if (!props.testId) return;

  loading.value = true;
  error.value = null;

  try {
    const test = cptStore.getTestById(props.testId);
    if (!test || !test.data || test.data.length === 0) {
      throw new Error('No data available for plotting');
    }

    const data = test.data;
    const traces = [
      {
        y: data.map(d => d.depth),
        x: data.map(d => d.qc),
        name: 'qc',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'blue' }
      },
      {
        y: data.map(d => d.depth),
        x: data.map(d => d.fs),
        name: 'fs',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'red' }
      },
      {
        y: data.map(d => d.depth),
        x: data.map(d => d.u2),
        name: 'u2',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'green' }
      }
    ];

    const layout = {
      title: `CPT Test ${test.testNumber}`,
      xaxis: {
        title: 'Value',
        autorange: true
      },
      yaxis: {
        title: 'Depth (m)',
        autorange: 'reversed'
      },
      showlegend: true,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1
      }
    };

    Plot.newPlot(plotContainer.value, traces, layout);
  } catch (err) {
    error.value = err.message;
    showErrorToast(toast, err, 'Failed to plot CPT data');
  } finally {
    loading.value = false;
  }
};

watch(() => props.visible, (newValue) => {
  if (newValue) {
    loadAndPlotData();
  }
});

onMounted(() => {
  if (props.visible) {
    loadAndPlotData();
  }
});
</script>

<style scoped>
.plot-container {
  width: 100%;
  height: 600px;
  position: relative;
}

.plot {
  width: 100%;
  height: 100%;
}
</style> 