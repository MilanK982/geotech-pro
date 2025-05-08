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
              <p>{{ project?.description }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.location') }}</label>
              <p>{{ project?.location }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.client') }}</label>
              <p>{{ project?.client }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.createdAt') }}</label>
              <p>{{ formatDate(project?.createdAt) }}</p>
            </div>
            <div class="field">
              <label>{{ $t('project.updatedAt') }}</label>
              <p>{{ formatDate(project?.updatedAt) }}</p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import CptTestList from '@/components/cpt/CptTestList.vue'
import ProjectForm from '@/components/project/ProjectForm.vue'
import SoilLayerList from '@/components/soil/SoilLayerList.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const toast = useToast()
const confirm = useConfirm()

const projectId = route.params.id
const project = ref(null)
const statistics = ref({
  totalCptTests: 0,
  totalSoilLayers: 0
})
const showFormDialog = ref(false)

const loadProject = async () => {
  try {
    project.value = await projectStore.getProjectById(projectId)
    statistics.value = await projectStore.getProjectStatistics(projectId)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load project details',
      life: 3000
    })
  }
}

const handleEdit = () => {
  showFormDialog.value = true
}

const handleDelete = () => {
  confirm.require({
    message: 'Are you sure you want to delete this project?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await projectStore.deleteProject(projectId)
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project deleted successfully',
          life: 3000
        })
        router.push('/projects')
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete project',
          life: 3000
        })
      }
    }
  })
}

const handleSaved = () => {
  showFormDialog.value = false
  loadProject()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadProject()
})
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