<template>
  <div>
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
      <Dropdown
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
        accept=".txt,.csv,.xls,.xlsx"
        @change="handleFileUpload"
      />
    </div>
    <div id="cpt-table"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Tabulator from 'tabulator-tables'; // Ispravljen uvoz
import 'tabulator-tables/dist/css/tabulator.min.css';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useGeotechnicalStore } from '../../store/geotechnical';
import { fetchLayers, saveCpt } from '../../services/api';

const store = useGeotechnicalStore();
const isSynced = ref(true);
const cptSheets = ref(store.cptSheets.map((sheet, index) => ({ ...sheet, index })));
const selectedCptIndex = ref(null);
const table = ref(null);

// Kolone
const columns = [
  { title: '#', rowHeader: true, formatter: 'rownum', width: 40, frozen: true, resizable: false },
  {
    title: 'Dubina (m)',
    field: 'depth',
    editor: 'number',
    hozAlign: 'right',
    validator: ['min:0'],
  },
  { title: 'Otpor konusa (MPa)', field: 'qc', editor: 'number', hozAlign: 'right' },
  { title: 'Trenje rukavca (kPa)', field: 'fs', editor: 'number', hozAlign: 'right' },
  { title: 'Porni pritisak (kPa)', field: 'u', editor: 'number', hozAlign: 'right' },
];

// Inicijalizacija Tabulator-a
onMounted(async () => {
  try {
    const data = await fetchLayers(store.currentProjectId);
    store.updateCptSheets(data.cpt_tests || []);
    cptSheets.value = store.cptSheets.map((sheet, index) => ({ ...sheet, index }));
    selectedCptIndex.value = cptSheets.value.length > 0 ? 0 : null;

    table.value = new Tabulator('#cpt-table', {
      height: '400px',
      layout: 'fitColumns',
      data: [],
      columns,
      selectableRange: 1,
      selectableRangeColumns: true,
      selectableRangeRows: true,
      selectableRangeClearCells: true,
      editTriggerEvent: 'dblclick',
      clipboard: true,
      clipboardCopyStyled: true,
      clipboardCopyConfig: { columnHeaders: false, rowHeaders: false },
      clipboardCopyRowRange: 'range',
      clipboardPasteParser: (clipboard) => {
        const rows = clipboard.split('\n').map((row) => row.split('\t').map((val) => val.trim()));
        const parsedData = rows
          .filter((row) => row.some((val) => val !== ''))
          .map((row) => ({
            depth: parseFloat(row[0]) || 0,
            qc: parseFloat(row[1]) || 0,
            fs: parseFloat(row[2]) || 0,
            u: parseFloat(row[3]) || 0,
          }));
        if (selectedCptIndex.value !== null && cptSheets.value[selectedCptIndex.value]) {
          cptSheets.value[selectedCptIndex.value].data = parsedData;
          isSynced.value = false;
        }
        return parsedData;
      },
      clipboardPasteAction: 'replace',
      columnDefaults: { headerSort: false, headerHozAlign: 'center', resizable: 'header' },
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

    switchCPTSheet();
  } catch (error) {
    console.error('Greška prilikom dohvatanja podataka:', error);
    alert('Greška prilikom dohvatanja podataka: ' + error.message);
  }
});

// Funkcije
const dodajCPTTest = () => {
  let testName = prompt('Unesite naziv CPT testa', `CPT Test ${cptSheets.value.length + 1}`);
  if (!testName) return;

  while (
    cptSheets.value.some((sheet) => sheet.title.trim().toLowerCase() === testName.trim().toLowerCase())
  ) {
    testName = prompt('Naziv CPT testa već postoji! Unesite jedinstveni naziv', testName);
    if (!testName) return;
  }

  cptSheets.value.push({
    title: testName,
    data: [{ depth: 0, qc: 0, fs: 0, u: 0 }],
    index: cptSheets.value.length,
  });
  selectedCptIndex.value = cptSheets.value.length - 1;
  switchCPTSheet();
  isSynced.value = false;
};

const importCPT = () => {
  document.getElementById('cpt-file').click();
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  let testName = prompt('Unesite naziv CPT testa za uvoz', file.name.split('.')[0]);
  if (!testName) return;

  while (
    cptSheets.value.some((sheet) => sheet.title.trim().toLowerCase() === testName.trim().toLowerCase())
  ) {
    testName = prompt('Naziv CPT testa već postoji! Unesite jedinstveni naziv', testName);
    if (!testName) return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    let rows = [];
    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      rows = text
        .split('\n')
        .map((line) => {
          const [depth, qc, fs, u] = line.split(/[\t,;]/).map(parseFloat);
          return { depth: depth || 0, qc: qc || 0, fs: 0, u: u || 0 };
        })
        .filter((row) => row.depth !== undefined);
    }
    cptSheets.value.push({
      title: testName,
      data: rows.length > 0 ? rows : [{ depth: 0, qc: 0, fs: 0, u: 0 }],
      index: cptSheets.value.length,
    });
    selectedCptIndex.value = cptSheets.value.length - 1;
    switchCPTSheet();
    isSynced.value = false;
    e.target.value = '';
  };
  reader.readAsText(file);
};

const deleteCPT = () => {
  if (selectedCptIndex.value === null) {
    alert('Molimo izaberite CPT test za brisanje!');
    return;
  }
  if (
    confirm(`Obrisati CPT test '${cptSheets.value[selectedCptIndex.value].title}'?`)
  ) {
    cptSheets.value.splice(selectedCptIndex.value, 1);
    cptSheets.value = cptSheets.value.map((sheet, index) => ({ ...sheet, index }));
    selectedCptIndex.value = null;
    switchCPTSheet();
    isSynced.value = false;
  }
};

const switchCPTSheet = () => {
  if (selectedCptIndex.value !== null && cptSheets.value[selectedCptIndex.value]) {
    table.value.setData(cptSheets.value[selectedCptIndex.value].data);
  } else {
    table.value.setData([]);
  }
};

const syncData = async () => {
  const updatedData = {
    cpt_tests: cptSheets.value.map((sheet) => ({
      id: sheet.id || null,
      name: sheet.title,
      data: sheet.data.map((row) => ({
        depth: Number(row.depth) || 0,
        qc: Number(row.qc) || 0,
        fs: Number(row.fs) || 0,
        u: Number(row.u) || 0,
      })),
    })),
  };

  try {
    const response = await saveCpt(store.currentProjectId, updatedData);
    store.updateCptSheets(response.cpt_tests);
    cptSheets.value = response.cpt_tests.map((test, index) => ({
      id: test.id,
      title: test.name,
      data: test.data,
      index,
    }));
    selectedCptIndex.value = cptSheets.value.length > 0 ? 0 : null;
    switchCPTSheet();
    isSynced.value = true;
  } catch (error) {
    console.error('Greška prilikom čuvanja:', error);
    alert('Greška prilikom čuvanja podataka: ' + error.message);
  }
};
</script>

<style scoped>
.mb-2 {
  margin-bottom: 0.5rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
.unsynced {
  background-color: #ffcccc;
}
</style>