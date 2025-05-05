<template>
    <div class="layout">
      <Sidebar />
      <div class="content">
        <Navbar />
        <Breadcrumb />
        <router-view />
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from './Sidebar.vue';
  import Navbar from './Navbar.vue';
  import Breadcrumb from './Breadcrumb.vue';
  
  export default {
    components: { Sidebar, Navbar, Breadcrumb },
  };
  </script>
  
  <style>
  .layout {
    display: flex;
  }
  .content {
    flex: 1;
    padding: 20px;
  }
  </style>