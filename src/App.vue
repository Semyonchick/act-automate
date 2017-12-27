<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
  @import "~foundation-sites/scss/foundation";

  $base-font-size: 14px;

  @include normalize();
  @include foundation-table();
  @include foundation-xy-grid-classes();
</style>
