import { defineStore } from 'pinia';
import axios from 'axios';

export const useSoilStore = defineStore('soil', {
  state: () => ({
    layers: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchLayers(modelId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/geotech/models/${modelId}/layers/`);
        this.layers = response.data.layers || [];
        return this.layers;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch soil layers';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async saveLayers(modelId, layers) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(`/geotech/models/${modelId}/layers/`, { layers });
        this.layers = response.data.layers || [];
        return this.layers;
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to save soil layers';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteLayer(modelId, layerId) {
      this.loading = true;
      this.error = null;
      try {
        await axios.delete(`/geotech/models/${modelId}/layers/${layerId}/`);
        this.layers = this.layers.filter(layer => layer.id !== layerId);
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to delete soil layer';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 