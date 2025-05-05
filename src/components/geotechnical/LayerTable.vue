<template>
  <div>
    <div class="mb-2">
      <Button label="Dodaj sloj" icon="pi pi-plus" @click="dodajSloj" />
      <Button
        label="Sačuvaj promene"
        icon="pi pi-save"
        :class="{ unsynced: !isSynced }"
        @click="syncData"
      />
      <Button label="Ukloni prazne slojeve" icon="pi pi-trash" @click="ukloniPrazneSlojeve" />
      <Button label="Kopiraj tabelu" icon="pi pi-copy" @click="copyTable" />
    </div>
    <div class="mb-2">
      <label>NPV (m): </label>
      <InputNumber
        v-model="npv"
        :step="0.01"
        :min="0"
        style="width: 100px"
        @update:modelValue="markUnsynced"
      />
      <label class="ml-2">NPV,max (m): </label>
      <InputNumber
        v-model="npvMax"
        :step="0.01"
        :min="0"
        style="width: 100px"
        @update:modelValue="markUnsynced"
      />
    </div>
    <div id="soil-table"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Tabulator from 'tabulator-tables'; // Ispravljen uvoz
import 'tabulator-tables/dist/css/tabulator.min.css';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import { useGeotechnicalStore } from '../../store/geotechnical';
import { fetchLayers, saveLayers } from '../../services/api';

const store = useGeotechnicalStore();
const isSynced = ref(true);
const npv = ref(store.groundwater?.npv || 0);
const npvMax = ref(store.groundwater?.npvMax || 0);
const table = ref(null);

// Kolone
const columns = [
  { title: '#', rowHeader: true, formatter: 'rownum', width: 40, frozen: true, resizable: false },
  { title: 'Naziv', field: 'name', editor: 'input', headerHozAlign: 'center' },
  {
    title: 'Dubina (m)',
    field: 'depth',
    editor: 'number',
    hozAlign: 'right',
    validator: ['min:0'],
    editorParams: { min: 0 },
    formatter: (cell) => {
      const value = cell.getValue();
      if (value < 0) cell.getElement().style.backgroundColor = 'red';
      return value;
    },
  },
  { title: 'Spec. težina (kN/m³)', field: 'unit_weight', editor: 'number', hozAlign: 'right' },
  { title: 'Kohezija (kPa)', field: 'cohesion', editor: 'number', hozAlign: 'right' },
  { title: 'Ugao trenja (°)', field: 'friction_angle', editor: 'number', hozAlign: 'right' },
  { title: 'Kompresibilnost (kPa)', field: 'compressibility', editor: 'number', hozAlign: 'right' },
  { title: 'Propustljivost (m/s)', field: 'permeability', editor: 'number', hozAlign: 'right' },
  { title: 'CPT podaci', field: 'cpt_data', editor: 'input' },
];

// Inicijalizacija Tabulator-a
onMounted(async () => {
  try {
    const data = await fetchLayers(store.currentProjectId);
    store.updateLayers(data.layers || []);
    store.updateGroundwater({ npv: data.npv || 0, npvMax: data.npv_max || 0 });
    npv.value = data.npv || 0;
    npvMax.value = data.npv_max || 0;

    table.value = new Tabulator('#soil-table', {
      height: '400px',
      layout: 'fitColumns',
      data: store.layers,
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
      clipboardPasteParser: 'range',
      clipboardPasteAction: 'range',
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
  } catch (error) {
    console.error('Greška prilikom dohvatanja podataka:', error);
    alert('Greška prilikom dohvatanja podataka: ' + error.message);
  }
});

// Funkcije
const dodajSloj = () => {
  const currentData = table.value.getData();
  const maxDepth = currentData.length > 0 ? Math.max(...currentData.map((row) => parseFloat(row.depth) || 0)) : 0;
  table.value.addRow({
    name: 'Novi sloj',
    depth: maxDepth,
    unit_weight: 18,
    cohesion: 0,
    friction_angle: 0,
    compressibility: 0,
    permeability: 0,
    cpt_data: null,
  });
};

const ukloniPrazneSlojeve = () => {
  const rows = table.value.getRows();
  let removed = false;
  rows.forEach((row) => {
    const data = row.getData();
    if (
      !data.name &&
      !data.depth &&
      !data.unit_weight &&
      !data.cohesion &&
      !data.friction_angle &&
      !data.compressibility &&
      !data.permeability &&
      !data.cpt_data
    ) {
      row.delete();
      removed = true;
    }
  });
  if (removed) {
    isSynced.value = false;
  } else {
    alert('Nema praznih slojeva za uklanjanje!');
  }
};

const copyTable = () => {
  const columnDefs = table.value.getColumns().filter((col) => col.getField());
  const headers = columnDefs.map((col) => col.getDefinition().title).join('\t');
  const data = table.value.getData().map((row) =>
    columnDefs.map((col) => row[col.getField()] || '').join('\t')
  ).join('\n');
  navigator.clipboard.writeText(headers + '\n' + data);
};

const syncData = async () => {
  const updatedData = {
    layers: table.value.getData().map((row) => ({
      id: row.id || null,
      name: row.name || 'Nepoznato',
      depth: Number(row.depth) || 0,
      unit_weight: Number(row.unit_weight) || 18,
      cohesion: Number(row.cohesion) || 0,
      friction_angle: Number(row.friction_angle) || 0,
      compressibility: Number(row.compressibility) || 0,
      permeability: Number(row.permeability) || null,
      cpt_data: row.cpt_data || null,
    })),
    npv: Number(npv.value) || 0,
    npv_max: Number(npvMax.value) || 0,
  };

  try {
    const response = await saveLayers(store.currentProjectId, updatedData);
    store.updateLayers(response.layers);
    store.updateGroundwater({ npv: response.npv, npvMax: response.npv_max });
    table.value.setData(response.layers);
    isSynced.value = true;
  } catch (error) {
    console.error('Greška prilikom čuvanja:', error);
    alert('Greška prilikom čuvanja podataka: ' + error.message);
  }
};

const markUnsynced = () => {
  isSynced.value = false;
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