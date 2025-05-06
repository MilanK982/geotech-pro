<!-- src/components/geotechnical/GeotechnicalModel.vue -->
<template>
  <div>
    <TabView v-model:activeIndex="activeTab">
      <TabPanel header="Slojevi">
        <LayerTable />
      </TabPanel>
      <TabPanel header="CPT Testovi">
        <CptTable />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import LayerTable from './LayerTable.vue';
import CptTable from './CptTable.vue';
import { useGeotechnicalStore } from '../../store/geotechnical';
import { useRoute } from 'vue-router';

const store = useGeotechnicalStore();
const route = useRoute();
const activeTab = ref(0);

store.setCurrentProjectId(route.params.modelId);
</script>