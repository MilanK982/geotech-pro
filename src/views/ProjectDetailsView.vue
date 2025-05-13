<template>
  <div class="project-details">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1>{{ project?.name }}</h1>
      <div class="flex gap-2">
        <Button
          :label="$t('common.edit')"
          icon="pi pi-pencil"
          @click="handleEdit"
        />
        <Button
          :label="$t('common.delete')"
          icon="pi pi-trash"
          class="p-button-danger"
          @click="handleDelete"
        />
      </div>
    </div>

    <div class="grid">
      <div class="col-12 md:col-6">
        <Card>
          <template #title>
            {{ $t('project.details') }}
          </template>
          <template #content>
            <div class="field">
              <label>{{ $t('project.description') }}</label>
              <p>{{ project?.description || '-' }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.location') }}</label>
              <p>{{ project?.location || '-' }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.client') }}</label>
              <p>{{ project?.client || '-' }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.status') }}</label>
              <Tag :value="project?.status" :severity="getStatusSeverity(project?.status)" />
            </div>
            <div class="field">
              <label>{{ $t('project.startDate') }}</label>
              <p>{{ formatDate(project?.start_date) }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.endDate') }}</label>
              <p>{{ formatDate(project?.end_date) }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.createdAt') }}</label>
              <p>{{ formatDate(project?.created_at) }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.updatedAt') }}</label>
              <p>{{ formatDate(project?.updated_at) }}</p>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6">
        <Card>
          <template #title>
            {{ $t('project.statistics') }}
          </template>
          <template #content>
            <div class="grid">
              <div class="col-6">
                <div class="stat-card">
                  <i class="pi pi-list stat-icon"></i>
                  <div class="stat-content">
                    <span class="stat-value">{{ statistics.totalCptTests }}</span>
                    <span class="stat-label">{{ $t('project.totalCptTests') }}</span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-card">
                  <i class="pi pi-chart-bar stat-icon"></i>
                  <div class="stat-content">
                    <span class="stat-value">{{ statistics.totalSoilLayers }}</span>
                    <span class="stat-label">{{ $t('project.totalSoilLayers') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12">
        <TabView>
          <TabPanel :header="$t('cpt.title')">
            <CptTestList :project-id="projectId" />
          </TabPanel>
          <TabPanel :header="$t('soil.title')">
            <SoilLayerList :project-id="projectId" />
          </TabPanel>
        </TabView>
      </div>
    </div>

    <Dialog
      v-model:visible="showFormDialog"
      :header="$t('project.edit')"
      :modal="true"
      :style="{ width: '50vw' }"
      :closable="true"
    >
      <ProjectForm
        :project-id="projectId"
        @saved="handleSaved"
        @cancel="showFormDialog = false"
      />
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project.store';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useConfirm } from 'primevue/useconfirm';
import CptTestList from '@/components/cpt/CptTestList.vue';
import ProjectForm from '@/components/project/ProjectForm.vue';
import SoilLayerList from '@/components/soil/SoilLayerList.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const toast = useToast();
const confirm = useConfirm();

const projectId = route.params.id;
const project = ref(null);
const statistics = ref({
  totalCptTests: 0,
  totalSoilLayers: 0,
});
const showFormDialog = ref(false);

const loadProject = async () => {
  try {
    project.value = await projectStore.fetchProject(projectId);
    statistics.value = await projectStore.getProjectStatistics(projectId);
  } catch (error) {
    showErrorToast(error, 'Failed to load project details');
  }
};

const handleEdit = () => {
  showFormDialog.value = true;
};

const handleDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this project?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await projectStore.deleteProject(projectId);
        showSuccessToast('Project deleted successfully');
        router.push('/projects');
      } catch (error) {
        showErrorToast(error, 'Failed to delete project');
      }
    },
  });
};

const handleSaved = () => {
  showFormDialog.value = false;
  loadProject();
};

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

onMounted(() => {
  loadProject();
});
</script>

<style scoped>
.project-details {
  padding: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--surface-card);
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
  color: var(--primary-color);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-label {
  color: var(--text-color-secondary);
}
</style>