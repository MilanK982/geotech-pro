// src/store/geotechnical.js
import { defineStore } from 'pinia';

export const useGeotechnicalStore = defineStore('geotechnical', {
  state: () => ({
    currentProjectId: null,
    layers: [],
    cptTests: [],
    npv: 0,
    npvMax: 0,
    groundwater: null,
    cptDataCache: new Map()
  }),

  actions: {
    setCurrentProjectId(projectId) {
      this.currentProjectId = projectId;
    },

    updateLayers(layers) {
      this.layers = layers;
    },

    updateGroundwater(groundwater) {
      this.groundwater = groundwater;
    },

    setLayers(layers) {
      this.layers = layers;
    },

    setCptTests(cptTests) {
      this.cptTests = cptTests;
    },

    setNpv(npv) {
      this.npv = npv;
    },

    setNpvMax(npvMax) {
      this.npvMax = npvMax;
    },

    updateLayer(index, layer) {
      if (this.layers[index]) {
        this.layers[index] = { ...this.layers[index], ...layer };
      }
    },

    addLayer(layer) {
      this.layers.push(layer);
    },

    removeLayer(index) {
      this.layers.splice(index, 1);
    },

    setCptData(modelId, data) {
      this.cptDataCache.set(modelId, data);
    },

    getCptData(modelId) {
      return this.cptDataCache.get(modelId);
    },

    clearCptData(modelId) {
      if (modelId) {
        this.cptDataCache.delete(modelId);
      } else {
        this.cptDataCache.clear();
      }
    },

    clearStore() {
      this.currentProjectId = null;
      this.layers = [];
      this.cptTests = [];
      this.npv = 0;
      this.npvMax = 0;
      this.groundwater = null;
      this.cptDataCache.clear();
    }
  }
});