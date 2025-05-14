<template>
  <form @submit.prevent="handleSubmit" class="p-fluid">
    <div class="field">
      <label for="name">Project Name</label>
      <InputText
        id="name"
        v-model="formData.name"
        :class="{ 'p-invalid': submitted && !formData.name }"
        required
      />
      <small class="p-error" v-if="submitted && !formData.name">Project name is required.</small>
    </div>

    <div class="field">
      <label for="description">Description</label>
      <Textarea
        id="description"
        v-model="formData.description"
        rows="3"
        autoResize
      />
    </div>

    <div class="field">
      <label for="location">Location</label>
      <InputText
        id="location"
        v-model="formData.location"
      />
    </div>

    <div class="field">
      <label for="client">Client</label>
      <InputText
        id="client"
        v-model="formData.client"
      />
    </div>

    <div class="field">
      <label for="status">Status</label>
      <Dropdown
        id="status"
        v-model="formData.status"
        :options="statusOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Select Status"
      />
    </div>

    <div class="field">
      <label for="startDate">Start Date</label>
      <Calendar
        id="startDate"
        v-model="formData.start_date"
        dateFormat="yy-mm-dd"
        :showIcon="true"
      />
    </div>

    <div class="field">
      <label for="endDate">End Date</label>
      <Calendar
        id="endDate"
        v-model="formData.end_date"
        dateFormat="yy-mm-dd"
        :showIcon="true"
      />
    </div>

    <div class="flex justify-content-end">
      <Button
        type="button"
        label="Cancel"
        class="p-button-text mr-2"
        @click="$emit('cancel')"
      />
      <Button
        type="submit"
        label="Save"
        :loading="loading"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

const props = defineProps({
  project: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      location: '',
      client: '',
      status: 'active',
      start_date: null,
      end_date: null
    })
  }
});

const emit = defineEmits(['submit', 'cancel']);

const loading = ref(false);
const submitted = ref(false);

const formData = ref({
  name: props.project.name || '',
  description: props.project.description || '',
  location: props.project.location || '',
  client: props.project.client || '',
  status: props.project.status || 'active',
  start_date: props.project.start_date ? new Date(props.project.start_date) : null,
  end_date: props.project.end_date ? new Date(props.project.end_date) : null
});

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' }
];

const handleSubmit = async () => {
  submitted.value = true;
  
  if (!formData.value.name) {
    return;
  }

  loading.value = true;
  try {
    emit('submit', {
      ...formData.value,
      start_date: formData.value.start_date ? formData.value.start_date.toISOString().split('T')[0] : null,
      end_date: formData.value.end_date ? formData.value.end_date.toISOString().split('T')[0] : null
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style> 