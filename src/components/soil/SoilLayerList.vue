<template>
  <div class="soil-layer-list">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>{{ $t('soil.title') }}</h2>
      <div class="flex gap-2">
        <Button
          :label="$t('soil.plotData')"
          icon="pi pi-chart-bar"
          @click="showPlotDialog = true"
        />
        <Button
          :label="$t('soil.newLayer')"
          icon="pi pi-plus"
          @click="handleNewLayer"
        />
      </div>
    </div>

    <div ref="tableRef" class="soil-table"></div>

    <Dialog
      v-model:visible="showFormDialog"
      :header="isEditing ? $t('soil.editLayer') : $t('soil.newLayer')"
      :modal="true"
      :style="{ width: '50vw' }"
      :closable="true"
    >
      <SoilLayerForm
        :project-id="projectId"
        :layer-id="selectedLayerId"
        @saved="handleSaved"
        @cancel="showFormDialog = false"
      />
    </Dialog>

    <SoilLayerPlot
      :project-id="projectId"
      v-model:visible="showPlotDialog"
    />

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Tabulator } from 'tabulator-tables';
import { useSoilStore } from '@/stores/soil';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useConfirm } from 'primevue/useconfirm';
import SoilLayerForm from './SoilLayerForm.vue';
import SoilLayerPlot from './SoilLayerPlot.vue';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const soilStore = useSoilStore()
const toast = useToast()
const confirm = useConfirm()

const tableRef = ref(null)
const table = ref(null)
const showFormDialog = ref(false)
const isEditing = ref(false)
const selectedLayerId = ref(null)
const showPlotDialog = ref(false)

const tableConfig = {
  height: 'calc(100vh - 300px)',
  layout: 'fitColumns',
  columns: [
    {
      title: 'ID',
      field: 'id',
      visible: false
    },
    {
      title: 'Layer Name',
      field: 'name',
      headerFilter: 'input',
      sorter: 'string'
    },
    {
      title: 'Top Depth',
      field: 'topDepth',
      headerFilter: 'input',
      sorter: 'number',
      formatter: (cell) => `${cell.getValue()} m`
    },
    {
      title: 'Bottom Depth',
      field: 'bottomDepth',
      headerFilter: 'input',
      sorter: 'number',
      formatter: (cell) => `${cell.getValue()} m`
    },
    {
      title: 'Thickness',
      field: 'thickness',
      sorter: 'number',
      formatter: (cell) => `${cell.getValue()} m`
    },
    {
      title: 'Soil Type',
      field: 'soilType',
      headerFilter: 'input',
      sorter: 'string'
    },
    {
      title: 'Actions',
      formatter: 'buttonCross',
      width: 100,
      cellClick: (e, cell) => {
        const row = cell.getRow()
        const data = row.getData()
        handleDelete(data)
      }
    }
  ],
  data: [],
  rowClick: (e, row) => {
    const data = row.getData()
    handleEdit(data)
  }
}

const loadLayers = async () => {
  try {
    await soilStore.fetchLayersByProject(props.projectId);
    table.value.setData(soilStore.layers);
  } catch (error) {
    showErrorToast(error, 'Failed to load soil layers');
  }
};

const handleNewLayer = () => {
  isEditing.value = false;
  selectedLayerId.value = null;
  showFormDialog.value = true;
};

const handleEdit = (layer) => {
  isEditing.value = true;
  selectedLayerId.value = layer.id;
  showFormDialog.value = true;
};

const handleDelete = (layer) => {
  confirm.require({
    message: 'Are you sure you want to delete this soil layer?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await soilStore.deleteLayer(props.projectId, layer.id);
        showSuccessToast('Soil layer deleted successfully');
        loadLayers();
      } catch (error) {
        showErrorToast(error, 'Failed to delete soil layer');
      }
    },
  });
};

const handleSaved = () => {
  showFormDialog.value = false;
  loadLayers();
  showSuccessToast('Soil layer saved successfully');
};

onMounted(() => {
  table.value = new Tabulator(tableRef.value, tableConfig);
  loadLayers();
});

onBeforeUnmount(() => {
  if (table.value) {
    table.value.destroy();
  }
});
</script>

<style scoped>
.soil-layer-list {
  padding: 1rem;
}

.soil-table {
  background-color: var(--surface-card);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.tabulator) {
  border: none;
  background-color: transparent;
}

:deep(.tabulator-header) {
  background-color: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
}

:deep(.tabulator-row) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.tabulator-row.tabulator-selected) {
  background-color: var(--primary-50);
}

:deep(.tabulator-cell) {
  padding: 0.75rem;
}

:deep(.tabulator-footer) {
  background-color: var(--surface-ground);
  border-top: 1px solid var(--surface-border);
}
</style> 