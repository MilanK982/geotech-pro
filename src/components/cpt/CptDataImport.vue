<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="$t('cpt.importData')"
    :modal="true"
    :style="{ width: '50vw' }"
  >
    <div class="p-fluid">
      <div class="field">
        <label for="file">{{ $t('cpt.selectFile') }}</label>
        <FileUpload
          id="file"
          mode="basic"
          :auto="true"
          accept=".csv,.xlsx"
          :maxFileSize="1000000"
          @upload="handleUpload"
          :chooseLabel="$t('cpt.chooseFile')"
        />
      </div>

      <div v-if="previewData.length > 0" class="field">
        <label>{{ $t('cpt.preview') }}</label>
        <DataTable
          :value="previewData"
          :rows="5"
          :paginator="true"
          class="p-datatable-sm"
          scrollable
          scrollHeight="200px"
        >
          <Column
            v-for="col in columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :style="{ minWidth: col.width }"
          />
        </DataTable>
      </div>
    </div>

    <template #footer>
      <Button
        :label="$t('common.cancel')"
        icon="pi pi-times"
        class="p-button-text"
        @click="$emit('update:visible', false)"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCptStore } from '@/stores/cpt.store';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const props = defineProps({
  projectId: { type: String, required: true },
  testId: { type: String, required: true },
  visible: { type: Boolean, required: true },
});

const emit = defineEmits(['update:visible', 'imported']);

const cptStore = useCptStore();
const toast = useToast();

const loading = ref(false);
const file = ref(null);
const previewData = ref([]);

const columns = [
  { field: 'depth', header: 'Depth (m)', width: '100px' },
  { field: 'qc', header: 'Cone Resistance (MPa)', width: '150px' },
  { field: 'fs', header: 'Sleeve Friction (kPa)', width: '150px' },
  { field: 'u2', header: 'Pore Pressure (kPa)', width: '150px' },
];

const hasFile = computed(() => !!file.value);

const handleUpload = async (event) => {
  try {
    const file = event.files[0];
    await cptStore.importData(props.projectId, props.testId, file);
    showSuccessToast(toast, 'CPT data imported successfully');
    emit('imported');
    emit('update:visible', false);
  } catch (error) {
    showErrorToast(toast, error, 'Failed to import CPT data');
  }
};

const parseFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const requiredHeaders = ['depth', 'qc', 'fs', 'u2'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        showErrorToast(toast, new Error(`Missing columns: ${missingHeaders.join(', ')}`), `Missing required columns`);
        return;
      }

      previewData.value = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            depth: parseFloat(values[headers.indexOf('depth')]),
            qc: parseFloat(values[headers.indexOf('qc')]),
            fs: parseFloat(values[headers.indexOf('fs')]),
            u2: parseFloat(values[headers.indexOf('u2')]),
          };
        })
        .filter(row => !isNaN(row.depth) && !isNaN(row.qc) && !isNaN(row.fs) && !isNaN(row.u2))
        .slice(0, 10);
    } catch (error) {
      showErrorToast(toast, error, 'Failed to parse file');
    }
  };
  reader.readAsText(file);
};

const handleImport = async () => {
  if (!file.value) return;

  loading.value = true;
  try {
    await cptStore.importData(props.projectId, props.testId, file.value);
    showSuccessToast(toast, 'Data imported successfully');
    emit('imported');
    emit('update:visible', false);
  } catch (error) {
    showErrorToast(toast, error, 'Failed to import data');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  file.value = null;
  previewData.value = [];
  emit('update:visible', false);
};

</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
}
</style> 