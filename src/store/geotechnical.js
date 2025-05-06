// src/store/geotechnical.js
import { defineStore } from 'pinia';

export const useGeotechnicalStore = defineStore('geotechnical', {
  state: () => ({
    currentProjectId: null,
    layers: [],
    cptSheets: [],
    groundwater: { npv: 0, npvMax: 0 },
  }),
  actions: {
    updateLayers(layers) {
      this.layers = layers;
    },
    updateCptSheets(sheets) {
      this.cptSheets = sheets;
    },
    updateGroundwater(data) {
      this.groundwater = data;
    },
    setCurrentProjectId(id) {
      this.currentProjectId = id;
    },
  },
});