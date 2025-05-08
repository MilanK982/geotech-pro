<template>
  <div class="dashboard">
    <div class="grid">
      <!-- Statistics Cards -->
      <div class="col-12 md:col-6 lg:col-3">
        <StatsCard
          :title="$t('dashboard.totalProjects')"
          :value="stats?.totalProjects || 0"
          :description="$t('dashboard.activeProjects')"
          icon="pi pi-folder"
        />
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <StatsCard
          :title="$t('dashboard.totalCptTests')"
          :value="stats?.totalCptTests || 0"
          :description="$t('dashboard.completedTests')"
          icon="pi pi-chart-line"
        />
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <StatsCard
          :title="$t('dashboard.totalSoilLayers')"
          :value="stats?.totalSoilLayers || 0"
          :description="$t('dashboard.analyzedLayers')"
          icon="pi pi-layers"
        />
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <StatsCard
          :title="$t('dashboard.recentActivity')"
          :value="stats?.recentActivity || 0"
          :description="$t('dashboard.last24Hours')"
          icon="pi pi-clock"
        />
      </div>

      <!-- Recent Projects -->
      <div class="col-12 lg:col-8">
        <RecentProjects />
      </div>

      <!-- Quick Actions -->
      <div class="col-12 lg:col-4">
        <Card class="quick-actions">
          <template #title>
            {{ $t('dashboard.quickActions') }}
          </template>
          <template #content>
            <div class="flex flex-column gap-3">
              <Button
                icon="pi pi-plus"
                :label="$t('projects.newProject')"
                @click="$router.push('/projects/new')"
                class="p-button-primary"
              />
              <Button
                icon="pi pi-file-import"
                :label="$t('dashboard.importCptData')"
                @click="$router.push('/import')"
                class="p-button-secondary"
              />
              <Button
                icon="pi pi-file-export"
                :label="$t('dashboard.exportData')"
                @click="$router.push('/export')"
                class="p-button-secondary"
              />
              <Button
                icon="pi pi-calculator"
                :label="$t('dashboard.calculations')"
                @click="$router.push('/calculations')"
                class="p-button-secondary"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProjectStore } from '@/stores/project.store';
import StatsCard from '@/components/dashboard/StatsCard.vue';
import RecentProjects from '@/components/dashboard/RecentProjects.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

const projectStore = useProjectStore();

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      projectStore.fetchProjectStats()
    ]);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
});
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

.quick-actions {
  height: 100%;
}

:deep(.p-card) {
  height: 100%;
}
</style> 