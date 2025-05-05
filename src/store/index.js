import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
  }),
  actions: {
    async fetchProjects() {
      // API poziv za projekte
    },
  },
});

export const useGeotechnicalStore = defineStore('geotechnical', {
  state: () => ({
    layers: [],
    cptData: [],
    groundwater: null,
  }),
  actions: {
    async fetchLayers(projectId) {
      // API poziv za slojeve tla
    },
  },
});