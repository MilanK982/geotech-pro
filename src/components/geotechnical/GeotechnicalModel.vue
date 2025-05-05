<template>
    <TabView>
      <TabPanel header="Slojevi tla">
        <LayerTable />
      </TabPanel>
      <TabPanel header="Nivo podzemne vode">
        <GroundWater />
      </TabPanel>
      <TabPanel header="CPT podaci">
        <CptTable />
      </TabPanel>
    </TabView>
  </template>
  
  <script>
  import TabView from 'primevue/tabview'; // Ispravljen uvoz
  import TabPanel from 'primevue/tabpanel'; // Ispravljen uvoz
  import LayerTable from '../components/geotechnical/LayerTable.vue';
  import GroundWater from '../components/geotechnical/GroundWater.vue';
  import CptTable from '../components/geotechnical/CptTable.vue';
  
  export default {
    components: { TabView, TabPanel, LayerTable, GroundWater, CptTable },
  };
  </script>