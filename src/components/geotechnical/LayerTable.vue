<template>
  <div class="layer-table-container">
    <div class="mb-2">
      <Button label="Dodaj sloj" icon="pi pi-plus" @click="dodajSloj" />
      <Button label="Sačuvaj" icon="pi pi-save" :class="{ unsynced: !isSynced }" @click="syncData" />
    </div>
    <div id="layer-table" class="layer-table"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import Button from 'primevue/button';
import { useGeotechnicalStore } from '@/stores/geotechnical.store';
import { fetchLayers, saveLayers } from '@/services/project.service';

const props = defineProps({
  modelId: {
    type: [String, Number],
    required: true
  }
});

const store = useGeotechnicalStore();
const isSynced = ref(true);
const npv = ref(store.groundwater?.npv || 0);
const npvMax = ref(store.groundwater?.npvMax || 0);
const table = ref(null);
const projectId = ref(null);

// Kolone
const columns = [
  {
    title: '#',
    formatter: 'rownum',
    headerSort: false,
    width: 50,
    cssClass: 'text-center'
  },
  {
    title: 'ID',
    field: 'id',
    visible: false
  },
  {
    title: 'Naziv',
    field: 'name',
    editor: 'input',
    validator: [
      { type: 'required' }
    ],
    headerSort: false,
    resizable: false
  },
  {
    title: 'Debljina (m)',
    field: 'thickness',
    editor: 'number',
    validator: [
      { type: 'required' },
      { type: 'numeric' },
      { type: 'min', value: 0 }
    ],
    headerSort: false,
    resizable: false
  },
  {
    title: 'Težina (kN/m³)',
    field: 'unit_weight',
    editor: 'number',
    validator: [
      { type: 'required' },
      { type: 'numeric' },
      { type: 'min', value: 0 }
    ],
    headerSort: false,
    resizable: false
  },
  {
    title: 'Kohezija (kPa)',
    field: 'cohesion',
    editor: 'number',
    validator: [
      { type: 'required' },
      { type: 'numeric' },
      { type: 'min', value: 0 }
    ],
    headerSort: false,
    resizable: false
  },
  {
    title: 'Ugao trenja (°)',
    field: 'friction_angle',
    editor: 'number',
    validator: [
      { type: 'required' },
      { type: 'numeric' },
      { type: 'min', value: 0 },
      { type: 'max', value: 45 }
    ],
    headerSort: false,
    resizable: false
  },
  {
    title: 'Modul (MPa)',
    field: 'elastic_modulus',
    editor: 'number',
    validator: [
      { type: 'required' },
      { type: 'numeric' },
      { type: 'min', value: 0 }
    ],
    headerSort: false,
    resizable: false
  },
  {
    title: 'Akcije',
    formatter: 'buttonCross',
    width: 70,
    headerSort: false,
    resizable: false,
    cellClick: function(e, cell) {
      const row = cell.getRow();
      const rowData = row.getData();
      removeLayer(rowData.id);
    }
  }
];

// Inicijalizacija Tabulator-a
onMounted(async () => {
  try {
    if (!props.modelId) {
      throw new Error('ID modela nije postavljen');
    }

    const data = await fetchLayers(props.modelId);
    console.log('Dobijeni podaci:', data);
    if (!data || !Array.isArray(data.layers)) {
      throw new Error('Invalid data format received from server');
    }
    
    projectId.value = data.project_id;
    console.log('Project ID:', projectId.value);
    store.updateLayers(data.layers || []);
    store.updateGroundwater({ npv: data.npv || 0, npvMax: data.npv_max || 0 });
    npv.value = data.npv || 0;
    npvMax.value = data.npv_max || 0;

    // Sačekamo da se DOM ažurira
    await nextTick();

    // Proverimo da li element postoji pre inicijalizacije
    const tableElement = document.getElementById('layer-table');
    if (!tableElement) {
      throw new Error('Table element not found');
    }

    table.value = new Tabulator('#layer-table', {
      height: '400px',
      layout: 'fitColumns',
      data: [],
      columns,
      selectableRange: true,
      selectableRangeColumns: true,
      selectableRangeRows: true,
      selectableRangeClearCells: true,
      editTriggerEvent: 'dblclick',
      clipboard: true,
      clipboardCopyStyled: true,
      clipboardCopyConfig: { 
        columnHeaders: false, 
        rowHeaders: false 
      },
      clipboardCopyRowRange: 'range',
      clipboardPasteAction: 'replace',
      columnDefaults: { 
        headerSort: false, 
        headerHozAlign: 'center', 
        resizable: false 
      }
    });

    table.value.on('tableBuilt', () => {
      table.value.setData(store.layers);
    });

    table.value.on('cellEdited', () => {
      isSynced.value = false;
    });
    table.value.on('rowAdded', () => {
      isSynced.value = false;
    });
    table.value.on('rowDeleted', () => {
      isSynced.value = false;
    });

  } catch (error) {
    console.error('Greška prilikom inicijalizacije tabele:', error);
    alert('Greška prilikom inicijalizacije tabele: ' + error.message);
  }
});

onBeforeUnmount(() => {
  if (table.value) {
    table.value.destroy();
  }
});

const dodajSloj = () => {
  const noviSloj = {
    name: `Sloj ${store.layers.length + 1}`,
    thickness: 1,
    unit_weight: 20,
    cohesion: 0,
    friction_angle: 30,
    elastic_modulus: 100,
  };
  store.updateLayers([...store.layers, noviSloj]);
  table.value.addRow(noviSloj);
  isSynced.value = false;
};

const removeLayer = (id) => {
  if (confirm('Da li ste sigurni da želite da obrišete ovaj sloj?')) {
    const index = store.layers.findIndex((layer) => layer.id === id);
    if (index !== -1) {
      store.updateLayers(store.layers.filter((layer) => layer.id !== id));
      table.value.deleteRow(id);
      isSynced.value = false;
    }
  }
};

const syncData = async () => {
  if (!projectId.value) {
    alert('ID projekta nije pronađen');
    return;
  }

  const updatedData = {
    name: "Geotechnical Model",
    project: projectId.value,
    npv: Number(npv.value) || 0,
    npv_max: Number(npvMax.value) || 0,
    layers: store.layers.map((layer) => ({
      id: layer.id || null,
      name: layer.name,
      depth: Number(layer.thickness) || 0,
      unit_weight: Number(layer.unit_weight) || 0,
      cohesion: Number(layer.cohesion) || 0,
      friction_angle: Number(layer.friction_angle) || 0,
      compressibility: Number(layer.elastic_modulus) || 0,
      permeability: Number(layer.poissons_ratio) || 0
    })),
    cpt_tests: [] // Dodajemo prazan niz za cpt_tests
  };

  try {
    console.log('Šaljemo podatke:', updatedData);
    const response = await saveLayers(props.modelId, updatedData);
    console.log('Odgovor servera:', response);
    store.updateLayers(response.layers);
    store.updateGroundwater({ 
      npv: response.npv, 
      npvMax: response.npv_max 
    });
    npv.value = response.npv;
    npvMax.value = response.npv_max;
    isSynced.value = true;
  } catch (error) {
    console.error('Greška prilikom čuvanja:', error);
    console.error('Detalji greške:', error.response?.data);
    alert('Greška prilikom čuvanja podataka: ' + (error.response?.data?.error || error.message));
  }
};
</script>

<style scoped>
.layer-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layer-table {
  flex: 1;
  min-height: 0;
}

:deep(.tabulator) {
  height: 100% !important;
}

:deep(.tabulator-tableholder) {
  overflow-y: auto;
}

.unsynced {
  background-color: #ff9800;
  color: white;
}

:deep(.p-button) {
  margin-right: 0.5rem;
}

:deep(.p-button:last-child) {
  margin-right: 0;
}
</style>