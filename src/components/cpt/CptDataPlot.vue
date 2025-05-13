<template>
  <Dialog
    v-model:visible="visible"
    :header="$t('cpt.plotData')"
    :modal="true"
    :style="{ width: '80vw' }"
    :closable="true"
  >
    <div class="p-fluid">
      <div class="grid">
        <div class="col-12">
          <div class="field">
            <label>{{ $t('cpt.depthVsQc') }}</label>
            <div class="chart-container">
              <canvas ref="qcChart"></canvas>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="field">
            <label>{{ $t('cpt.depthVsFs') }}</label>
            <div class="chart-container">
              <canvas ref="fsChart"></canvas>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="field">
            <label>{{ $t('cpt.depthVsU2') }}</label>
            <div class="chart-container">
              <canvas ref="u2Chart"></canvas>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="field">
            <label>{{ $t('cpt.frictionRatio') }}</label>
            <div class="chart-container">
              <canvas ref="frChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button
          :label="$t('common.close')"
          class="p-button-text"
          @click="handleClose"
        />
        <Button
          :label="$t('cpt.exportPlot')"
          class="p-button-success"
          @click="handleExport"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useCptStore } from '@/stores/cpt';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

Chart.register(...registerables);

const props = defineProps({
  projectId: { type: String, required: true },
  testId: { type: String, required: true },
  visible: { type: Boolean, required: true },
});

const emit = defineEmits(['update:visible']);

const cptStore = useCptStore();
const toast = useToast();

const qcChart = ref(null);
const fsChart = ref(null);
const u2Chart = ref(null);
const frChart = ref(null);

let charts = {
  qc: null,
  fs: null,
  u2: null,
  fr: null,
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
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
      display: false,
    },
  },
};

const createChart = (canvas, data, label, color) => {
  return new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
      }],
    },
    options: chartOptions,
  });
};

const calculateFrictionRatio = (data) => {
  return data.map(point => ({
    x: (point.fs / point.qc) * 100,
    y: point.depth,
  }));
};

const initCharts = (data) => {
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });

  charts.qc = createChart(
    qcChart.value,
    data.map(point => ({ x: point.qc, y: point.depth })),
    'Cone Resistance (MPa)',
    '#FF6384'
  );

  charts.fs = createChart(
    fsChart.value,
    data.map(point => ({ x: point.fs, y: point.depth })),
    'Sleeve Friction (kPa)',
    '#36A2EB'
  );

  charts.u2 = createChart(
    u2Chart.value,
    data.map(point => ({ x: point.u2, y: point.depth })),
    'Pore Pressure (kPa)',
    '#4BC0C0'
  );

  charts.fr = createChart(
    frChart.value,
    calculateFrictionRatio(data),
    'Friction Ratio (%)',
    '#FFCE56'
  );
};

const handleClose = () => {
  emit('update:visible', false);
};

const handleExport = () => {
  try {
    const canvas = qcChart.value; // Primer: izvoz prvog grafika
    const link = document.createElement('a');
    link.download = `cpt-plot-${props.testId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showSuccessToast('Plot exported successfully');
  } catch (error) {
    showErrorToast(error, 'Failed to export plot');
  }
};

watch(() => props.visible, async (newValue) => {
  if (newValue && props.testId) {
    const test = cptStore.getTestById(props.testId);
    if (test && test.data && test.data.length > 0) {
      initCharts(test.data);
    } else {
      showErrorToast(new Error('No data available'), 'No data available for plotting');
      handleClose();
    }
  }
});

onMounted(() => {
  if (props.visible && props.testId) {
    const test = cptStore.getTestById(props.testId);
    if (test && test.data && test.data.length > 0) {
      initCharts(test.data);
    }
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.field {
  margin-bottom: 2rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
</style> 