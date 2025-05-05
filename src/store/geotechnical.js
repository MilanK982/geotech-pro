// src/store/geotechnical.js
import { defineStore } from 'pinia';

export const useGeotechnicalStore = defineStore('geotechnical', {
  state: () => ({
    currentProjectId: null,
    layers: [
      { id: 1, name: 'Sloj 1', depth: 2.5, unit_weight: 18, cohesion: 0, friction_angle: 0, compressibility: 0, permeability: 0, cpt_data: null },
      { id: 2, name: 'Sloj 2', depth: 5.0, unit_weight: 18, cohesion: 0, friction_angle: 0, compressibility: 0, permeability: 0, cpt_data: null },
    ],
    cptSheets: [
      { id: 1, title: 'CPT 1', data: [{ depth: 0, qc: 0, fs: 0, u: 50 }] },
      { id: 2, title: 'CPT 2', data: [{ depth: 0, qc: 0, fs: 0, u: 75 }] },
    ],
    groundwater: { npv: 0, npvMax: 0 },
  }),
  actions: {
    updateLayers(newLayers) {
      this.layers = newLayers;
    },
    updateCptSheets(newSheets) {
      this.cptSheets = newSheets;
    },
    updateGroundwater(data) {
      this.groundwater = data;
    },
    setCurrentProjectId(id) {
      this.currentProjectId = id;
    },
  },
});