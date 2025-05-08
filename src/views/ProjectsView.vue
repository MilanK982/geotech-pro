<template>
  <div class="projects-view">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>{{ $t('projects.title') }}</h1>
      <Button
        :label="$t('projects.newProject')"
        icon="pi pi-plus"
        @click="$router.push('/projects/new')"
      />
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="projects"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          stripedRows
          class="p-datatable-sm"
          v-model:filters="filters"
          filterDisplay="menu"
          :globalFilterFields="['name', 'description', 'location', 'status']"
        >
          <template #header>
            <div class="flex justify-content-between">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  :placeholder="$t('common.search')"
                />
              </span>
            </div>
          </template>

          <Column
            :field="'name'"
            :header="$t('projects.projectName')"
            sortable
            style="min-width: 200px"
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
            :field="'description'"
            :header="$t('projects.projectDescription')"
            style="min-width: 300px"
          />

          <Column
            :field="'location'"
            :header="$t('projects.location')"
            sortable
            style="min-width: 150px"
          />

          <Column
            :field="'status'"
            :header="$t('projects.status')"
            sortable
            style="min-width: 120px"
          >
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <Column
            :field="'startDate'"
            :header="$t('projects.startDate')"
            sortable
            style="min-width: 120px"
          >
            <template #body="{ data }">
              {{ formatDate(data.startDate) }}
            </template>
          </Column>

          <Column
            :field="'endDate'"
            :header="$t('projects.endDate')"
            sortable
            style="min-width: 120px"
          >
            <template #body="{ data }">
              {{ formatDate(data.endDate) }}
            </template>
          </Column>

          <Column
            :field="'actions'"
            :header="$t('projects.actions')"
            style="min-width: 100px"
          >
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-text p-button-rounded"
                  @click="editProject(data)"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-rounded p-button-danger"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project.store';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { FilterMatchMode } from 'primevue/api';

const projectStore = useProjectStore();
const confirm = useConfirm();
const toast = useToast();
const router = useRouter();

const loading = ref(false);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const projects = computed(() => projectStore.projects);

onMounted(async () => {
  try {
    loading.value = true;
    await projectStore.fetchProjects();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load projects',
      life: 3000
    });
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

const editProject = (project) => {
  router.push(`/projects/${project.id}/edit`);
};

const confirmDelete = (project) => {
  confirm.require({
    message: 'Are you sure you want to delete this project?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteProject(project),
    reject: () => {}
  });
};

const deleteProject = async (project) => {
  try {
    await projectStore.deleteProject(project.id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Project deleted successfully',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete project',
      life: 3000
    });
  }
};
</script>

<style scoped>
.projects-view {
  padding: 1rem;
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