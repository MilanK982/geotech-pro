<template>
  <div class="cpt-test-form">
    <form @submit.prevent="handleSubmit" class="p-fluid">
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="field">
            <label for="testNumber">{{ $t('cpt.testNumber') }}</label>
            <InputText
              id="testNumber"
              v-model="formData.testNumber"
              :class="{ 'p-invalid': v$.testNumber.$invalid && v$.testNumber.$dirty }"
              @blur="v$.testNumber.$touch()"
            />
            <small class="p-error" v-if="v$.testNumber.$error">
              {{ $t('validation.testNumberRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label for="testDate">{{ $t('cpt.testDate') }}</label>
            <Calendar
              id="testDate"
              v-model="formData.testDate"
              :class="{ 'p-invalid': v$.testDate.$invalid && v$.testDate.$dirty }"
              @blur="v$.testDate.$touch()"
              dateFormat="dd.mm.yy"
              :showIcon="true"
            />
            <small class="p-error" v-if="v$.testDate.$error">
              {{ $t('validation.testDateRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label for="depth">{{ $t('cpt.depth') }}</label>
            <InputNumber
              id="depth"
              v-model="formData.depth"
              :class="{ 'p-invalid': v$.depth.$invalid && v$.depth.$dirty }"
              @blur="v$.depth.$touch()"
              suffix=" m"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
            <small class="p-error" v-if="v$.depth.$error">
              {{ $t('validation.depthRequired') }}
            </small>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label for="coordinates">{{ $t('cpt.coordinates') }}</label>
            <InputText
              id="coordinates"
              v-model="formData.coordinates"
              placeholder="X, Y"
            />
          </div>
        </div>

        <div class="col-12">
          <div class="field">
            <label for="description">{{ $t('cpt.description') }}</label>
            <Textarea
              id="description"
              v-model="formData.description"
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
            <Button
              type="button"
              :label="$t('cpt.importData')"
              class="p-button-info"
              @click="showImportDialog = true"
            />
            <Button
              type="button"
              :label="$t('cpt.exportData')"
              class="p-button-help"
              @click="handleExport"
              :disabled="!hasData"
            />
            <Button
              type="button"
              :label="$t('cpt.plotData')"
              class="p-button-success"
              @click="showPlotDialog = true"
              :disabled="!hasData"
            />
          </div>
        </div>
      </div>
    </form>

    <CptDataImport
      v-model:visible="showImportDialog"
      :project-id="projectId"
      :test-id="testId"
      @imported="handleDataImported"
    />

    <CptDataPlot
      v-model:visible="showPlotDialog"
      :project-id="projectId"
      :test-id="testId"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useCptStore } from '@/stores/cpt.store';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import CptDataImport from './CptDataImport.vue';
import CptDataPlot from './CptDataPlot.vue';

const props = defineProps({
  projectId: { type: String, required: true },
  testId: { type: String, default: null },
});

const emit = defineEmits(['cancel', 'saved']);

const cptStore = useCptStore();
const toast = useToast();

const formData = ref({
  testNumber: '',
  testDate: null,
  depth: null,
  coordinates: '',
  description: '',
});

const rules = {
  testNumber: { required },
  testDate: { required },
  depth: { required },
};

const v$ = useVuelidate(rules, formData);

const loading = ref(false);
const hasData = computed(() => {
  if (props.testId) {
    const test = cptStore.getTestById(props.testId);
    return test && test.data && test.data.length > 0;
  }
  return false;
});

const showImportDialog = ref(false);
const showPlotDialog = ref(false);

const handleSubmit = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  loading.value = true;
  try {
    if (props.testId) {
      await cptStore.updateTest(props.projectId, props.testId, formData.value);
      showSuccessToast(toast, 'CPT test updated successfully');
    } else {
      await cptStore.createTest(props.projectId, formData.value);
      showSuccessToast(toast, 'CPT test created successfully');
    }
    emit('saved');
  } catch (error) {
    showErrorToast(toast, error, 'Failed to save CPT test');
  } finally {
    loading.value = false;
  }
};

const handleDataImported = () => {
  if (props.testId) {
    const test = cptStore.getTestById(props.testId);
    if (test) {
      formData.value = {
        ...formData.value,
        data: test.data,
      };
    }
  }
};

const handleExport = async () => {
  if (!props.testId) return;

  try {
    await cptStore.exportData(props.projectId, props.testId);
    showSuccessToast(toast, 'CPT data exported successfully');
  } catch (error) {
    showErrorToast(toast, error, 'Failed to export data');
  }
};

if (props.testId) {
  const test = cptStore.getTestById(props.testId);
  if (test) {
    formData.value = {
      testNumber: test.testNumber,
      testDate: new Date(test.testDate),
      depth: test.depth,
      coordinates: test.coordinates,
      description: test.description,
    };
  }
}
</script>

<style scoped>
.cpt-test-form {
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