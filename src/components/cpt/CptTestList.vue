<template>
  <div class="cpt-test-list">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>{{ $t('cpt.title') }}</h2>
      <Button
        :label="$t('cpt.newTest')"
        icon="pi pi-plus"
        @click="handleNewTest"
      />
    </div>

    <DataTable
      :value="tests"
      :loading="loading"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :globalFilterFields="['testNumber', 'description']"
      v-model:filters="filters"
      filterDisplay="menu"
      :emptyMessage="$t('cpt.noTests')"
      class="p-datatable-sm"
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
        field="testNumber"
        :header="$t('cpt.testNumber')"
        sortable
        :filterField="'testNumber'"
        :showFilterMenu="false"
      >
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            class="p-column-filter"
            :placeholder="$t('common.search')"
          />
        </template>
      </Column>

      <Column
        field="testDate"
        :header="$t('cpt.testDate')"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data }">
          {{ formatDate(data.testDate) }}
        </template>
      </Column>

      <Column
        field="depth"
        :header="$t('cpt.depth')"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data }">
          {{ data.depth }} m
        </template>
      </Column>

      <Column
        field="coordinates"
        :header="$t('cpt.coordinates')"
        :showFilterMenu="false"
      />

      <Column
        field="description"
        :header="$t('cpt.description')"
        :showFilterMenu="false"
      >
        <template #body="{ data }">
          <span class="line-clamp-2">{{ data.description }}</span>
        </template>
      </Column>

      <Column :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text"
              @click="handleEdit(data)"
              v-tooltip.top="$t('common.edit')"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-text p-button-danger"
              @click="handleDelete(data)"
              v-tooltip.top="$t('common.delete')"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="showFormDialog"
      :header="isEditing ? $t('cpt.editTest') : $t('cpt.newTest')"
      :modal="true"
      :style="{ width: '50vw' }"
      :closable="true"
    >
      <CptTestForm
        :project-id="projectId"
        :test-id="selectedTestId"
        @saved="handleSaved"
        @cancel="showFormDialog = false"
      />
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCptStore } from '@/stores/cpt'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import CptTestForm from './CptTestForm.vue'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const cptStore = useCptStore()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const tests = ref([])
const showFormDialog = ref(false)
const isEditing = ref(false)
const selectedTestId = ref(null)

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  testNumber: { value: null, matchMode: 'contains' }
})

const loadTests = async () => {
  loading.value = true
  try {
    tests.value = await cptStore.getTestsByProject(props.projectId)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load CPT tests',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleNewTest = () => {
  isEditing.value = false
  selectedTestId.value = null
  showFormDialog.value = true
}

const handleEdit = (test) => {
  isEditing.value = true
  selectedTestId.value = test.id
  showFormDialog.value = true
}

const handleDelete = (test) => {
  confirm.require({
    message: 'Are you sure you want to delete this CPT test?',
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await cptStore.deleteTest(props.projectId, test.id)
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'CPT test deleted successfully',
          life: 3000
        })
        loadTests()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete CPT test',
          life: 3000
        })
      }
    }
  })
}

const handleSaved = () => {
  showFormDialog.value = false
  loadTests()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadTests()
})
</script>

<style scoped>
.cpt-test-list {
  padding: 1rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 