<template>
  <div class="dashboard-view">
    <h1>{{ $t('dashboard.title') }}</h1>

    <div class="grid">
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>
            {{ $t('dashboard.totalProjects') }}
          </template>
          <template #content>
            <div class="stat-value">{{ stats.totalProjects }}</div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>
            {{ $t('dashboard.totalCptTests') }}
          </template>
          <template #content>
            <div class="stat-value">{{ stats.totalCptTests }}</div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>
            {{ $t('dashboard.totalSoilLayers') }}
          </template>
          <template #content>
            <div class="stat-value">{{ stats.totalSoilLayers }}</div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-3">
        <Card class="stat-card">
          <template #title>
            {{ $t('dashboard.recentActivity') }}
          </template>
          <template #content>
            <div class="stat-value">{{ stats.recentActivity }}</div>
          </template>
        </Card>
      </div>
    </div>

    <Card class="mt-4">
      <template #title>
        {{ $t('dashboard.recentProjects') }}
      </template>
      <template #content>
        <DataTable
          :value="recentProjects"
          :loading="loading"
          stripedRows
          class="p-datatable-sm"
        >
          <Column
            field="name"
            :header="$t('projects.projectName')"
            sortable
          >
            <template #body="{ data }">
              <router-link
                :to="`/projects/${data.id}`"
                class="text-primary hover:underline"
              >
                {{ data.name }}
              </router-link>
            </template>
          </Column>
          <Column
            field="description"
            :header="$t('projects.projectDescription')"
          />
          <Column
            field="status"
            :header="$t('projects.status')"
          >
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>
          <Column
            field="updated_at"
            :header="$t('projects.updatedAt')"
            sortable
          >
            <template #body="{ data }">
              {{ formatDate(data.updated_at) }}
            </template>
          </Column>
          <Column
            field="actions"
            :header="$t('projects.actions')"
          >
            <template #body="{ data }">
              <Button
                icon="pi pi-trash"
                class="p-button-text p-button-rounded p-button-danger"
                @click="confirmDelete(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Added computed
import { useProjectStore } from '@/stores/project.store';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const projectStore = useProjectStore();
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const loading = ref(false);

// Computed property for stats
const stats = computed(() => {
  return projectStore.stats || {
    totalProjects: 0,
    totalCptTests: 0,
    totalSoilLayers: 0,
    recentActivity: 0,
  };
});

// Computed property for recent projects
const recentProjects = computed(() => {
  return projectStore.recentProjects || [];
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

const confirmDelete = (project) => {
  confirm.require({
    message: 'Are you sure you want to delete this project?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await projectStore.deleteProject(project.id);
        showSuccessToast('Project deleted successfully');
      } catch (error) {
        showErrorToast(error, 'Failed to delete project');
      }
    },
  });
};

onMounted(async () => {
  try {
    loading.value = true;
    await projectStore.fetchProjects();
    await projectStore.fetchProjectStats();
  } catch (error) {
    showErrorToast(error, 'Failed to load dashboard data');
  } finally {
    loading.value = false;
  }
});

</script>

<style scoped>
.dashboard-view {
  padding: 1rem;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
}

:deep(.p-datatable) {
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.5rem;
}
</style>