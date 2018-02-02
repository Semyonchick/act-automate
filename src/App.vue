<template>
    <div id="app">
        <!--<h1>Система статистики</h1>-->
        <div class="float-right">
            <button @click="refresh()" class="button hollow small">&#x21bb;</button>
        </div>
        <ul class="menu simple">
            <li><a href="#/acts">Акты</a></li>
            <li><a href="#/bills">Счета</a></li>
            <li><a href="#/tasks">Задачи</a></li>
            <li class="float-right"><a href="#/act">+акт</a></li>
        </ul>
        <div class="clearfix"></div>

        <router-view/>
    </div>
</template>

<script>
  export default {
    name: 'app',
    methods: {
      refresh () {
        sessionStorage.clear()
        location.reload()
      }
    }
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
    @include foundation-menu;

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
