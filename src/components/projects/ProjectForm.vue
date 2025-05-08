<template>
  <form @submit.prevent="handleSubmit" class="project-form">
    <div class="grid">
      <div class="col-12">
        <div class="field">
          <label for="name" class="block mb-2">{{ $t('projects.projectName') }}</label>
          <InputText
            id="name"
            v-model="formData.name"
            :class="{ 'p-invalid': v$.name.$invalid && v$.name.$dirty }"
            class="w-full"
          />
          <small class="p-error" v-if="v$.name.$invalid && v$.name.$dirty">
            {{ $t('validation.projectNameRequired') }}
          </small>
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <label for="description" class="block mb-2">{{ $t('projects.projectDescription') }}</label>
          <Textarea
            id="description"
            v-model="formData.description"
            rows="4"
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <label for="location" class="block mb-2">{{ $t('projects.location') }}</label>
          <InputText
            id="location"
            v-model="formData.location"
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12 md:col-6">
        <div class="field">
          <label for="startDate" class="block mb-2">{{ $t('projects.startDate') }}</label>
          <Calendar
            id="startDate"
            v-model="formData.startDate"
            dateFormat="dd.mm.yy"
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12 md:col-6">
        <div class="field">
          <label for="endDate" class="block mb-2">{{ $t('projects.endDate') }}</label>
          <Calendar
            id="endDate"
            v-model="formData.endDate"
            dateFormat="dd.mm.yy"
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <label for="status" class="block mb-2">{{ $t('projects.status') }}</label>
          <Dropdown
            id="status"
            v-model="formData.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12">
        <div class="flex justify-content-end gap-2">
          <Button
            type="button"
            :label="$t('common.cancel')"
            class="p-button-secondary"
            @click="$router.back()"
          />
          <Button
            type="submit"
            :label="isEdit ? $t('common.save') : $t('common.create')"
            :loading="loading"
          />
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useProjectStore } from '@/stores/project.store';
import { useToast } from 'primevue/usetoast';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  }
});

const projectStore = useProjectStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const formData = ref({
  name: '',
  description: '',
  location: '',
  startDate: null,
  endDate: null,
  status: 'active'
});

const loading = ref(false);

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' }
];

const rules = {
  name: { required }
};

const v$ = useVuelidate(rules, formData);

onMounted(async () => {
  if (props.isEdit) {
    try {
      const project = await projectStore.fetchProject(route.params.id);
      formData.value = { ...project };
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to load project',
        life: 3000
      });
      router.push('/projects');
    }
  }
});

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  loading.value = true;
  try {
    if (props.isEdit) {
      await projectStore.updateProject(route.params.id, formData.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project updated successfully',
        life: 3000
      });
    } else {
      await projectStore.createProject(formData.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Project created successfully',
        life: 3000
      });
    }
    router.push('/projects');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save project',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.project-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.field {
  margin-bottom: 1.5rem;
}
</style> 