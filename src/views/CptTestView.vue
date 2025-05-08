<template>
  <div class="cpt-test-view">
    <div class="card">
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <h2>{{ isEdit ? $t('cpt.editTest') : $t('cpt.newTest') }}</h2>
          <Button
            icon="pi pi-arrow-left"
            class="p-button-text"
            @click="$router.back()"
          />
        </div>
      </template>

      <template #content>
        <CptTestForm
          :project-id="projectId"
          :test-id="testId"
          @cancel="$router.back()"
          @saved="handleSaved"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CptTestForm from '@/components/cpt/CptTestForm.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.projectId)
const testId = computed(() => route.params.testId)
const isEdit = computed(() => !!testId.value)

const handleSaved = () => {
  router.push(`/projects/${projectId.value}`)
}
</script>

<style scoped>
.cpt-test-view {
  padding: 1rem;
}
</style> 