<template>
  <div class="project-detail" v-if="project">
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1>{{ project.name }}</h1>
        <p class="text-500 mt-2">{{ project.description }}</p>
      </div>
      <div class="flex gap-2">
        <Button
          :label="$t('common.edit')"
          icon="pi pi-pencil"
          @click="$router.push(`/projects/${project.id}/edit`)"
        />
        <Button
          :label="$t('common.delete')"
          icon="pi pi-trash"
          class="p-button-danger"
          @click="confirmDelete"
        />
      </div>
    </div>

    <div class="grid">
      <!-- Project Details -->
      <div class="col-12 md:col-6 lg:col-4">
        <Card>
          <template #title>
            {{ $t('projects.details') }}
          </template>
          <template #content>
            <div class="flex flex-column gap-3">
              <div>
                <label class="block text-500 mb-1">{{ $t('projects.location') }}</label>
                <span>{{ project.location || '-' }}</span>
              </div>
              <div>
                <label class="block text-500 mb-1">{{ $t('projects.startDate') }}</label>
                <span>{{ formatDate(project.startDate) }}</span>
              </div>
              <div>
                <label class="block text-500 mb-1">{{ $t('projects.endDate') }}</label>
                <span>{{ formatDate(project.endDate) }}</span>
              </div>
              <div>
                <label class="block text-500 mb-1">{{ $t('projects.status') }}</label>
                <Tag
                  :value="project.status"
                  :severity="getStatusSeverity(project.status)"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- CPT Tests -->
      <div class="col-12 md:col-6 lg:col-4">
        <Card>
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>{{ $t('cpt.title') }}</span>
              <Button
                icon="pi pi-plus"
                class="p-button-text p-button-rounded"
                @click="$router.push(`/projects/${project.id}/cpt/new`)"
              />
            </div>
          </template>
          <template #content>
            <div v-if="project.cptTests?.length" class="flex flex-column gap-2">
              <div
                v-for="test in project.cptTests"
                :key="test.id"
                class="flex justify-content-between align-items-center p-2 border-1 border-round"
              >
                <div>
                  <div class="font-bold">{{ test.testNumber }}</div>
                  <div class="text-sm text-500">
                    {{ test.depth }}m
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-text p-button-rounded"
                    @click="$router.push(`/projects/${project.id}/cpt/${test.id}/edit`)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-rounded p-button-danger"
                    @click="confirmDeleteCptTest(test)"
                  />
                </div>
              </div>
            </div>
            <div v-else class="text-center p-4">
              <i class="pi pi-chart-line text-4xl text-500 mb-3"></i>
              <p class="text-500">{{ $t('cpt.noTests') }}</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Soil Layers -->
      <div class="col-12 md:col-6 lg:col-4">
        <Card>
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>{{ $t('soil.title') }}</span>
              <Button
                icon="pi pi-plus"
                class="p-button-text p-button-rounded"
                @click="$router.push(`/projects/${project.id}/soil/new`)"
              />
            </div>
          </template>
          <template #content>
            <div v-if="project.soilLayers?.length" class="flex flex-column gap-2">
              <div
                v-for="layer in project.soilLayers"
                :key="layer.id"
                class="flex justify-content-between align-items-center p-2 border-1 border-round"
              >
                <div>
                  <div class="font-bold">{{ layer.layerName }}</div>
                  <div class="text-sm text-500">
                    {{ layer.topDepth }}m - {{ layer.bottomDepth }}m
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-text p-button-rounded"
                    @click="$router.push(`/projects/${project.id}/soil/${layer.id}/edit`)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-rounded p-button-danger"
                    @click="confirmDeleteSoilLayer(layer)"
                  />
                </div>
              </div>
            </div>
            <div v-else class="text-center p-4">
              <i class="pi pi-layers text-4xl text-500 mb-3"></i>
              <p class="text-500">{{ $t('soil.noLayers') }}</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project.store';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';

const projectStore = useProjectStore();
const confirm = useConfirm();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const project = ref(null);
const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    project.value = await projectStore.fetchProject(route.params.id);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load project',
      life: 3000
    });
    router.push('/projects');
  } finally {
    loading.value = false;
  }
});

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

const getStatusSeverity = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'info';
    case 'on_hold':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return null;
  }
};

const confirmDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this project?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteProject(),
    reject: () => {}
  });
};

const deleteProject = async () => {
  try {
    await projectStore.deleteProject(route.params.id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Project deleted successfully',
      life: 3000
    });
    router.push('/projects');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete project',
      life: 3000
    });
  }
};

const confirmDeleteCptTest = (test) => {
  confirm.require({
    message: 'Are you sure you want to delete this CPT test?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteCptTest(test),
    reject: () => {}
  });
};

const deleteCptTest = async (test) => {
  try {
    await projectStore.deleteCptTest(route.params.id, test.id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'CPT test deleted successfully',
      life: 3000
    });
    project.value = await projectStore.fetchProject(route.params.id);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete CPT test',
      life: 3000
    });
  }
};

const confirmDeleteSoilLayer = (layer) => {
  confirm.require({
    message: 'Are you sure you want to delete this soil layer?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteSoilLayer(layer),
    reject: () => {}
  });
};

const deleteSoilLayer = async (layer) => {
  try {
    await projectStore.deleteSoilLayer(route.params.id, layer.id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Soil layer deleted successfully',
      life: 3000
    });
    project.value = await projectStore.fetchProject(route.params.id);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete soil layer',
      life: 3000
    });
  }
};
</script>

<style scoped>
.project-detail {
  padding: 1rem;
}
</style> 