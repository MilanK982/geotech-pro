<template>
  <div class="cpt-table-container">
    <div class="mb-2">
      <Button label="Dodaj CPT test" icon="pi pi-plus" @click="dodajCPTTest" />
      <Button label="Uvezi CPT" icon="pi pi-upload" @click="importCPT" />
      <Button label="Obriši CPT" icon="pi pi-trash" @click="deleteCPT" />
      <Button
        label="Sačuvaj"
        icon="pi pi-save"
        :class="{ unsynced: !isSynced }"
        @click="syncData"
      />
      <Select
        v-model="selectedCptIndex"
        :options="cptSheets"
        optionLabel="title"
        optionValue="index"
        placeholder="Izaberite CPT list"
        class="ml-2"
        @change="switchCPTSheet"
      />
      <input
        type="file"
        id="cpt-file"
        style="display: none"
        accept=".txt,.csv"
        @change="handleFileUpload"
      />
    </div>
    <div id="cpt-table" class="cpt-table"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, onActivated, onDeactivated, computed } from 'vue';
import { useGeotechnicalStore } from '@/stores/geotechnical.store';
import { fetchLayers, saveCpt } from '../../services/api';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import Papa from 'papaparse';
import Button from 'primevue/button';
import Select from 'primevue/select';

const props = defineProps({
  modelId: {
    type: [String, Number],
    required: true
  }
});

const store = useGeotechnicalStore();
const isSynced = ref(true);
const cptSheets = ref([]);
const selectedCptIndex = ref(null);
const table = ref(null);
const projectId = ref(null);
const isInitialized = ref(false);
const cptData = computed(() => store.getCptData(props.modelId));

const columns = [
  {
    title: "Dubina [m]",
    field: "depth",
    editor: "number",
    validator: "numeric",
    width: 120,
    cssClass: "text-right"
  },
  {
    title: "qc [MPa]",
    field: "qc",
    editor: "number",
    validator: "numeric",
    width: 120,
    cssClass: "text-right"
  },
  {
    title: "fs [kPa]",
    field: "fs",
    editor: "number",
    validator: "numeric",
    width: 120,
    cssClass: "text-right"
  },
  {
    title: "u2 [kPa]",
    field: "u2",
    editor: "number",
    validator: "numeric",
    width: 120,
    cssClass: "text-right"
  }
];

async function initializeData() {
  try {
    if (!props.modelId) {
      throw new Error('ID modela nije postavljen');
    }

    // Proveravamo da li imamo keširane podatke
    const cachedData = store.getCptData(props.modelId);
    if (cachedData) {
      console.log('Koristim keširane podatke');
      projectId.value = cachedData.project_id;
      cptSheets.value = cachedData.cpt_tests.map((test, index) => ({
        id: test.id,
        title: test.name,
        data: test.data || [],
        index
      }));
      
      if (cptSheets.value.length > 0) {
        selectedCptIndex.value = 0;
      }
    } else {
      console.log('Učitavam podatke sa servera');
      const data = await fetchLayers(props.modelId);
      console.log('Dobijeni podaci:', data);

      projectId.value = data.project_id;
      
      if (data.cpt_tests && Array.isArray(data.cpt_tests)) {
        cptSheets.value = data.cpt_tests.map((test, index) => ({
          id: test.id,
          title: test.name,
          data: test.data || [],
          index
        }));
        
        if (cptSheets.value.length > 0) {
          selectedCptIndex.value = 0;
        }
      } else {
        cptSheets.value = [];
        selectedCptIndex.value = null;
      }

      // Keširamo podatke u store
      store.setCptData(props.modelId, data);
    }

    await nextTick();
    if (!isInitialized.value) {
      initTable();
      isInitialized.value = true;
    }
  } catch (error) {
    console.error('Greška prilikom inicijalizacije tabele:', error);
    alert('Greška prilikom inicijalizacije tabele: ' + error.message);
  }
}

onMounted(() => {
  console.log('CptTable mounted');
  initializeData();
});

function initTable() {
  if (table.value) {
    table.value.destroy();
  }

  nextTick(() => {
    const tableElement = document.getElementById('cpt-table');
    if (!tableElement) {
      console.error('CPT table element not found');
      return;
    }

    table.value = new Tabulator("#cpt-table", {
      data: [],
      columns: columns,
      layout: "fitColumns",
      height: "50vh",
      virtualDom: true,
      virtualDomBuffer: 300,
      reactiveData: true,
      history: true,
      clipboard: true,
      dataChanged: function(data) {
        const currentSheet = cptSheets.value[selectedCptIndex.value];
        if (currentSheet) {
          currentSheet.data = data;
          const cachedData = store.getCptData(props.modelId);
          if (cachedData) {
            cachedData.cpt_tests[selectedCptIndex.value].data = data;
            store.setCptData(props.modelId, cachedData);
          }
        }
      },
      ajaxError: function(xhr, textStatus, errorThrown) {
        console.error('Greška prilikom učitavanja podataka:', errorThrown);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Greška prilikom učitavanja podataka';
        tableElement.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
      },
      selectableRangeMode: "click",
      selectableRangeRows: true,
      selectableRangeColumns: true,
      selectableRangeClearCells: true,
      selectableRangeCopy: true,
      selectableRangePaste: true,
      selectableRangeFill: true,
      selectableRangeFillDirection: "right",
      selectableRangeFillMode: "copy",
      cellEdited: function(cell) {
        isSynced.value = false;
        cell.getElement().classList.add('edited');
        setTimeout(() => cell.getElement().classList.remove('edited'), 1000);
      }
    });

    table.value.on("tableBuilt", function() {
      if (selectedCptIndex.value !== null && cptSheets.value.length > 0) {
        const selectedSheet = cptSheets.value[selectedCptIndex.value];
        if (selectedSheet && selectedSheet.data) {
          table.value.setData(selectedSheet.data, true);
        }
      }
    });
  });
}

async function syncData() {
  try {
    if (!props.modelId || !projectId.value) {
      throw new Error('ID modela ili projekta nije postavljen');
    }

    const tableData = table.value.getData();
    const currentSheet = cptSheets.value[selectedCptIndex.value];

    if (!currentSheet) {
      throw new Error('Nije izabran CPT list');
    }

    const updatedData = {
      name: "Geotechnical Model",
      project: projectId.value,
      cpt_tests: cptSheets.value.map((sheet, index) => ({
        id: sheet.id,
        name: sheet.title,
        data: index === selectedCptIndex.value ? tableData : sheet.data
      }))
    };

    await saveCpt(props.modelId, updatedData);
    
    // Ažuriramo keš u store
    store.setCptData(props.modelId, {
      ...store.getCptData(props.modelId),
      cpt_tests: updatedData.cpt_tests
    });
    
    isSynced.value = true;
  } catch (error) {
    console.error('Greška prilikom čuvanja podataka:', error);
    alert('Greška prilikom čuvanja podataka: ' + error.message);
  }
}

function dodajCPTTest() {
  const newSheet = {
    id: Date.now(),
    title: `CPT Test ${cptSheets.value.length + 1}`,
    data: [],
    index: cptSheets.value.length
  };
  
  cptSheets.value.push(newSheet);
  selectedCptIndex.value = newSheet.index;
  table.value.setData([]);
  isSynced.value = false;
}

function deleteCPT() {
  if (selectedCptIndex.value !== null) {
    cptSheets.value.splice(selectedCptIndex.value, 1);
    cptSheets.value = cptSheets.value.map((sheet, index) => ({
      ...sheet,
      index
    }));
    
    if (cptSheets.value.length > 0) {
      selectedCptIndex.value = 0;
      const selectedSheet = cptSheets.value[0];
      table.value.setData(selectedSheet.data || []);
    } else {
      selectedCptIndex.value = null;
      table.value.setData([]);
    }
    isSynced.value = false;
  }
}

function switchCPTSheet() {
  if (selectedCptIndex.value !== null && table.value) {
    const selectedSheet = cptSheets.value[selectedCptIndex.value];
    if (selectedSheet) {
      if (table.value.tableBuilt) {
        table.value.setData(selectedSheet.data || [], true);
      } else {
        table.value.on("tableBuilt", function() {
          table.value.setData(selectedSheet.data || [], true);
        });
      }
    }
  }
}

function importCPT() {
  document.getElementById('cpt-file').click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      // Prvo razbijemo tekst na redove
      const lines = e.target.result.split('\n');
      
      // Procesiramo svaki red
      const processedData = lines
        .map(line => line.trim())
        .filter(line => line.length > 0) // Uklonimo prazne redove
        .map(line => {
          // Razbijemo red na vrednosti (podržavamo i tabulator i tačku-zarez)
          const values = line.split(/[\t;]+/);
          
          // Proverimo da li imamo dovoljno vrednosti
          if (values.length < 4) {
            console.warn('Nedovoljno vrednosti u redu:', values);
            return null;
          }

          return {
            depth: parseFloat(values[0] || 0),
            qc: parseFloat(values[1] || 0),
            fs: parseFloat(values[2] || 0),
            u2: parseFloat(values[3] || 0)
          };
        })
        .filter(Boolean); // Uklonimo null vrednosti

      // Filtrirajmo nevažeće redove
      const validData = processedData.filter(row => 
        !isNaN(row.depth) && 
        !isNaN(row.qc) && 
        !isNaN(row.fs) && 
        !isNaN(row.u2)
      );

      // Sortirajmo podatke po dubini
      validData.sort((a, b) => a.depth - b.depth);

      if (validData.length === 0) {
        alert('Nema validnih podataka za uvoženje');
        return;
      }

      // Zatražimo naziv CPT opita
      const cptName = prompt('Unesite naziv CPT opita:', `CPT Test ${cptSheets.value.length + 1}`);
      if (!cptName) return;

      // Kreiramo novi CPT sheet
      const newSheet = {
        id: Date.now(),
        title: cptName,
        data: validData,
        index: cptSheets.value.length
      };
      
      cptSheets.value.push(newSheet);
      selectedCptIndex.value = newSheet.index;
      
      table.value.setData(validData);
      isSynced.value = false;
    } else {
      alert('Podržani su samo CSV i TXT fajlovi');
    }
  };

  reader.readAsText(file);
}

watch(selectedCptIndex, (newValue) => {
  if (newValue !== null) {
    switchCPTSheet();
  }
});

onBeforeUnmount(() => {
  console.log('CptTable beforeUnmount');
  if (table.value) {
    table.value.destroy();
  }
});

onActivated(() => {
  console.log('CptTable activated');
  if (!isInitialized.value) {
    initializeData();
  } else {
    // Ako je tabela već inicijalizovana, samo ažuriramo podatke
    nextTick(() => {
      if (selectedCptIndex.value !== null && cptSheets.value.length > 0) {
        const selectedSheet = cptSheets.value[selectedCptIndex.value];
        if (selectedSheet && selectedSheet.data) {
          table.value?.setData(selectedSheet.data, true);
        }
      }
    });
  }
});

onDeactivated(() => {
  console.log('CptTable deactivated');
  // Čuvamo trenutno stanje pre deaktivacije
  if (table.value) {
    const currentSheet = cptSheets.value[selectedCptIndex.value];
    if (currentSheet) {
      currentSheet.data = table.value.getData();
      // Ažuriramo keš u store
      const cachedData = store.getCptData(props.modelId);
      if (cachedData) {
        cachedData.cpt_tests[selectedCptIndex.value].data = currentSheet.data;
        store.setCptData(props.modelId, cachedData);
      }
    }
  }
});
</script>

<style scoped>
.cpt-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  padding: 1rem;
}

.cpt-table {
  flex: 1;
  min-height: 0;
  margin-top: 1rem;
  height: 50vh !important;
}

.mb-2 {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.unsynced {
  background-color: #ffd700 !important;
}

:deep(.tabulator) {
  border: 1px solid #ddd;
}

:deep(.tabulator-header) {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

:deep(.tabulator-row) {
  border-bottom: 1px solid #dee2e6;
}

:deep(.tabulator-cell) {
  padding: 0.5rem;
}

:deep(.tabulator-row.tabulator-selected) {
  background-color: #e3f2fd;
}

:deep(.tabulator-row.tabulator-selected:hover) {
  background-color: #bbdefb;
}

:deep(.tabulator-row:hover) {
  background-color: #f5f5f5;
}

/* Stilovi za feedback */
:deep(.edited) {
  background-color: #e8f5e9 !important;
  transition: background-color 0.3s ease;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #ff5252;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>