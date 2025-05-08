import { defineStore } from 'pinia';
import projectService from '../services/project.service';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    stats: null,
    loading: false,
    error: null
  }),

  getters: {
    getProjectById: (state) => (id) => {
      return state.projects.find(project => project.id === id);
    },
    recentProjects: (state) => {
      return [...state.projects]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    }
  },

  actions: {
    async fetchProjects() {
      this.loading = true;
      this.error = null;
      try {
        const projects = await projectService.getProjects();
        this.projects = projects;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch projects';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProject(id) {
      this.loading = true;
      this.error = null;
      try {
        const project = await projectService.getProject(id);
        this.currentProject = project;
        return project;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch project';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProject(projectData) {
      this.loading = true;
      this.error = null;
      try {
        const project = await projectService.createProject(projectData);
        this.projects.push(project);
        return project;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create project';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProject(id, projectData) {
      this.loading = true;
      this.error = null;
      try {
        const updatedProject = await projectService.updateProject(id, projectData);
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index] = updatedProject;
        }
        if (this.currentProject?.id === id) {
          this.currentProject = updatedProject;
        }
        return updatedProject;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update project';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProject(id) {
      this.loading = true;
      this.error = null;
      try {
        await projectService.deleteProject(id);
        this.projects = this.projects.filter(p => p.id !== id);
        if (this.currentProject?.id === id) {
          this.currentProject = null;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete project';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProjectStats() {
      this.loading = true;
      this.error = null;
      try {
        const stats = await projectService.getProjectStats();
        this.stats = stats;
        return stats;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch project stats';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 