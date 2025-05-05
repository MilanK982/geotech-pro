<template>
    <Tree :value="nodes" selectionMode="single" @node-select="onNodeSelect" />
  </template>
  
  <script>
  import { Tree } from 'primevue/tree';
  import { useProjectStore } from '../../store/modules/project';
  
  export default {
    components: { Tree },
    setup() {
      const store = useProjectStore();
      const nodes = computed(() =>
        store.projects.map((project) => ({
          key: project.id,
          label: project.name,
          children: project.models.map((model) => ({
            key: model.id,
            label: model.name,
          })),
        }))
      );
  
      const onNodeSelect = (event) => {
        // Obradi selekciju projekta ili modela
      };
  
      return { nodes, onNodeSelect };
    },
  };
  </script>