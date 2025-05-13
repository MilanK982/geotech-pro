<template>
  <div class="soil-layer-form">
    <form @submit.prevent="handleSubmit" class="p-fluid">
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="name">{{ $t('soil.layerName') }}</label>
            <InputText
              id="name"
              v-model="formData.name"
              :class="{ 'p-invalid': v$.name.$invalid && v$.name.$dirty }"
              @blur="v$.name.$touch()"
            />
            <small class="p-error" v-if="v$.name.$error">
              {{ $t('validation.layerNameRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label for="soilType">{{ $t('soil.soilType') }}</label>
            <Dropdown
              id="soilType"
              v-model="formData.soilType"
              :options="soilTypes"
              optionLabel="name"
              optionValue="value"
              :class="{ 'p-invalid': v$.soilType.$invalid && v$.soilType.$dirty }"
              @blur="v$.soilType.$touch()"
            />
            <small class="p-error" v-if="v$.soilType.$error">
              {{ $t('validation.soilTypeRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label for="topDepth">{{ $t('soil.topDepth') }}</label>
            <InputNumber
              id="topDepth"
              v-model="formData.topDepth"
              :class="{ 'p-invalid': v$.topDepth.$invalid && v$.topDepth.$dirty }"
              @blur="v$.topDepth.$touch()"
              suffix=" m"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
            <small class="p-error" v-if="v$.topDepth.$error">
              {{ $t('validation.topDepthRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label for="bottomDepth">{{ $t('soil.bottomDepth') }}</label>
            <InputNumber
              id="bottomDepth"
              v-model="formData.bottomDepth"
              :class="{ 'p-invalid': v$.bottomDepth.$invalid && v$.bottomDepth.$dirty }"
              @blur="v$.bottomDepth.$touch()"
              suffix=" m"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
            <small class="p-error" v-if="v$.bottomDepth.$error">
              {{ $t('validation.bottomDepthRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12">
          <div class="field">
            <label for="properties">{{ $t('soil.properties') }}</label>
            <Textarea
              id="properties"
              v-model="formData.properties"
              rows="3"
              autoResize
            />
          </div>
        </div>

        <div class="col-12">
          <div class="flex flex-wrap gap-2">
            <Button
              type="submit"
              :label="$t('common.save')"
              :loading="loading"
              :disabled="v$.$invalid"
            />
            <Button
              type="button"
              :label="$t('common.cancel')"
              class="p-button-secondary"
              @click="$emit('cancel')"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useSoilStore } from '@/stores/soil';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  layerId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['cancel', 'saved'])

const soilStore = useSoilStore()
const toast = useToast()

const formData = ref({
  name: '',
  soilType: null,
  topDepth: null,
  bottomDepth: null,
  properties: ''
})

const rules = {
  name: { required },
  soilType: { required },
  topDepth: { required },
  bottomDepth: { required }
}

const v$ = useVuelidate(rules, formData)

const loading = ref(false)

const soilTypes = [
  { name: 'Clay', value: 'CLAY' },
  { name: 'Silt', value: 'SILT' },
  { name: 'Sand', value: 'SAND' },
  { name: 'Gravel', value: 'GRAVEL' },
  { name: 'Rock', value: 'ROCK' }
]

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  if (!soilStore.validateLayerDepths(formData.value)) {
    showErrorToast(new Error('Invalid depths'), 'Bottom depth must be greater than top depth');
    return;
  }

  loading.value = true;
  try {
    if (props.layerId) {
      await soilStore.updateLayer(props.projectId, props.layerId, formData.value);
      showSuccessToast('Soil layer updated successfully');
    } else {
      await soilStore.createLayer(props.projectId, formData.value);
      showSuccessToast('Soil layer created successfully');
    }
    emit('saved');
  } catch (error) {
    showErrorToast(error, 'Failed to save soil layer');
  } finally {
    loading.value = false;
  }
};

// Calculate thickness when depths change
watch([() => formData.value.topDepth, () => formData.value.bottomDepth], () => {
  if (formData.value.topDepth != null && formData.value.bottomDepth != null) {
    formData.value.thickness = soilStore.calculateLayerThickness(formData.value)
  }
})

// Load layer data if editing
if (props.layerId) {
  const layer = soilStore.getLayerById(props.layerId)
  if (layer) {
    formData.value = {
      name: layer.name,
      soilType: layer.soilType,
      topDepth: layer.topDepth,
      bottomDepth: layer.bottomDepth,
      properties: layer.properties
    }
  }
}
</script>

<style scoped>
.soil-layer-form {
  padding: 1rem;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
}
</style> 