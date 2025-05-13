<template>
  <div class="geotechnical-model">
    <h1>Geotehnički model</h1>
    <TabView>
      <TabPanel header="Slojevi tla">
        <LayerTable :modelId="modelId" />
      </TabPanel>
      <TabPanel header="Nivo podzemne vode">
        <GroundWater :modelId="modelId" />
      </TabPanel>
      <TabPanel header="CPT podaci">
        <keep-alive :include="['CptTable']">
          <CptTable :modelId="modelId" />
        </keep-alive>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import LayerTable from './LayerTable.vue';
import GroundWater from './GroundWater.vue';
import CptTable from './CptTable.vue';
import { useGeotechnicalStore } from '@/stores/geotechnical.store';

const props = defineProps({
  modelId: {
    type: [String, Number],
    required: true
  }
});

const store = useGeotechnicalStore();

onMounted(() => {
  if (props.modelId) {
    store.setCurrentProjectId(props.modelId);
  } else {
    console.error('Model ID nije pronađen u props');
  }
});
</script>

<style scoped>
.geotechnical-model {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-tabview) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.p-tabview-panels) {
  flex: 1;
  overflow: hidden;
}

:deep(.p-tabview-panel) {
  height: 100%;
  overflow: hidden;
}

h1 {
  margin-bottom: 1rem;
}
</style>