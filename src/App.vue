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

    @include normalize;
    @include foundation-table;
    @include foundation-xy-grid-classes;
    @include foundation-forms;
    @include foundation-float-classes;
    @include foundation-button;

    tbody tr {
        &.selected{
            background: #cdcfff;
            &:nth-child(even) {
                background: #c1c3f3;

            }
        }
    }
    .fixed-footer {
        .content {
            position: fixed;
            left:0;
            right:0;
            bottom:0;
            background: white;
            padding-top: 10px;
        }
    }
    .input-group {
        select {
            width: 30%;
            margin: 0;
        }
        .space {
            width: 20px;
        }
    }
</style>
