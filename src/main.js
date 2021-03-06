// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

// VueRangedatePicker.default.install(Vue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {App},
  watch: {
    $route (to, from) {
      if (to.name) localStorage.setItem('navigate', to.name)
    }
  },
  created () {
    if (localStorage.getItem('navigate')) {
      console.log(localStorage.getItem('navigate'))
      this.$router.push({name: localStorage.getItem('navigate')})
    }
  }
})
