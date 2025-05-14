<template>
  <Card class="recent-projects">
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <span>{{ $t('dashboard.recentProjects') }}</span>
        <Button
          icon="pi pi-plus"
          :label="$t('projects.newProject')"
          @click="$router.push('/projects/new')"
          class="p-button-sm"
        />
      </div>
    </template>
    <template #content>
      <DataTable
        :value="projects"
        :loading="loading"
        class="p-datatable-sm"
        :paginator="false"
        :rows="5"
        stripedRows
      >
        <Column :field="'name'" :header="$t('projects.projectName')">
          <template #body="{ data }">
            <router-link
              :to="`/projects/${data.id}`"
              class="text-primary hover:underline"
            >
              {{ data.name }}
            </router-link>
          </template>
        </Column>
        <Column :field="'description'" :header="$t('projects.projectDescription')" />
        <Column :field="'updatedAt'" :header="$t('projects.lastModified')">
          <template #body="{ data }">
            {{ formatDate(data.updatedAt) }}
          </template>
        </Column>
        <Column :field="'actions'" :header="$t('projects.actions')">
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
</template>

<script setup>
import { computed } from 'vue';
import { useProjectStore } from '@/stores/project.store';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

const projectStore = useProjectStore();
const confirm = useConfirm();
const toast = useToast();

const projects = computed(() => projectStore.recentProjects);
const loading = computed(() => projectStore.loading);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const editProject = (project) => {
  // Implement edit functionality
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
    showSuccessToast(toast, 'Project deleted successfully');
  } catch (error) {
    showErrorToast(toast, error, 'Failed to delete project');
  }
};
</script>

<style scoped>
.recent-projects {
  height: 100%;
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