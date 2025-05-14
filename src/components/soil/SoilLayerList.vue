<template>
  <div class="soil-layer-list">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>Soil Layers</h2>
      <Button
        icon="pi pi-plus"
        label="Add Layer"
        @click="showAddLayerDialog = true"
      />
    </div>

    <div v-if="loading" class="flex justify-content-center">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="p-error">
      {{ error }}
    </div>

    <div v-else>
      <DataTable
        :value="layers"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        tableStyle="min-width: 50rem"
      >
        <Column field="name" header="Name" sortable></Column>
        <Column field="depth" header="Depth (m)" sortable>
          <template #body="{ data }">
            {{ data.depth.toFixed(2) }}
          </template>
        </Column>
        <Column field="unit_weight" header="Unit Weight (kN/m³)" sortable>
          <template #body="{ data }">
            {{ data.unit_weight.toFixed(2) }}
          </template>
        </Column>
        <Column field="cohesion" header="Cohesion (kPa)" sortable>
          <template #body="{ data }">
            {{ data.cohesion.toFixed(2) }}
          </template>
        </Column>
        <Column field="friction_angle" header="Friction Angle (°)" sortable>
          <template #body="{ data }">
            {{ data.friction_angle.toFixed(2) }}
          </template>
        </Column>
        <Column field="compressibility" header="Compressibility" sortable>
          <template #body="{ data }">
            {{ data.compressibility.toFixed(2) }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text mr-2"
              @click="editLayer(data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-text p-button-danger"
              @click="confirmDeleteLayer(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="showAddLayerDialog"
      header="Add Soil Layer"
      :modal="true"
      class="p-fluid"
    >
      <div class="field">
        <label for="name">Name</label>
        <InputText
          id="name"
          v-model="newLayer.name"
          required
          autofocus
          :class="{ 'p-invalid': submitted && !newLayer.name }"
        />
        <small class="p-error" v-if="submitted && !newLayer.name">Name is required.</small>
      </div>

      <div class="field">
        <label for="depth">Depth (m)</label>
        <InputNumber
          id="depth"
          v-model="newLayer.depth"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          required
        />
      </div>

      <div class="field">
        <label for="unit_weight">Unit Weight (kN/m³)</label>
        <InputNumber
          id="unit_weight"
          v-model="newLayer.unit_weight"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          required
        />
      </div>

      <div class="field">
        <label for="cohesion">Cohesion (kPa)</label>
        <InputNumber
          id="cohesion"
          v-model="newLayer.cohesion"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          required
        />
      </div>

      <div class="field">
        <label for="friction_angle">Friction Angle (°)</label>
        <InputNumber
          id="friction_angle"
          v-model="newLayer.friction_angle"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          required
        />
      </div>

      <div class="field">
        <label for="compressibility">Compressibility</label>
        <InputNumber
          id="compressibility"
          v-model="newLayer.compressibility"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          required
        />
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="showAddLayerDialog = false"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="saveLayer"
          :loading="saving"
        />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSoilStore } from '@/stores/soil';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ProgressSpinner from 'primevue/progressspinner';
import ConfirmDialog from 'primevue/confirmdialog';

const props = defineProps({
  modelId: {
    type: [String, Number],
    required: true
  }
});

const soilStore = useSoilStore();
const toast = useToast();
const confirm = useConfirm();
const route = useRoute();

const loading = ref(false);
const saving = ref(false);
const submitted = ref(false);
const showAddLayerDialog = ref(false);
const layers = ref([]);

const newLayer = ref({
  name: '',
  depth: 0,
  unit_weight: 18,
  cohesion: 0,
  friction_angle: 0,
  compressibility: 0
});

onMounted(async () => {
  await loadLayers();
});

const loadLayers = async () => {
  loading.value = true;
  try {
    layers.value = await soilStore.fetchLayers(props.modelId);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load soil layers',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const saveLayer = async () => {
  submitted.value = true;
  
  if (!newLayer.value.name) {
    return;
  }

  saving.value = true;
  try {
    const updatedLayers = [...layers.value, newLayer.value];
    await soilStore.saveLayers(props.modelId, updatedLayers);
    layers.value = updatedLayers;
    showAddLayerDialog.value = false;
    resetForm();
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Soil layer added successfully',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save soil layer',
      life: 3000
    });
  } finally {
    saving.value = false;
  }
};

const editLayer = (layer) => {
  newLayer.value = { ...layer };
  showAddLayerDialog.value = true;
};

const confirmDeleteLayer = (layer) => {
  confirm.require({
    message: 'Are you sure you want to delete this layer?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteLayer(layer)
  });
};

const deleteLayer = async (layer) => {
  try {
    await soilStore.deleteLayer(props.modelId, layer.id);
    layers.value = layers.value.filter(l => l.id !== layer.id);
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Soil layer deleted successfully',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete soil layer',
      life: 3000
    });
  }
};

const resetForm = () => {
  newLayer.value = {
    name: '',
    depth: 0,
    unit_weight: 18,
    cohesion: 0,
    friction_angle: 0,
    compressibility: 0
  };
  submitted.value = false;
};
</script>

<style scoped>
.soil-layer-list {
  padding: 1rem;
}
</style> 