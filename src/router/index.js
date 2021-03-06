import Vue from 'vue'
import Router from 'vue-router'
import BillList from '@/components/BillList'
import ActList from '@/components/ActList'
import ActEdit from '@/components/ActEdit'
import TaskLog from '@/components/TaskLog'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/acts'
    },
    {
      path: '/acts',
      name: 'ActList',
      component: ActList
    },
    {
      path: '/act/:id',
      name: 'ActEdit',
      component: ActEdit
    },
    {
      path: '/act',
      name: 'ActAdd',
      component: ActEdit
    },
    {
      path: '/bills',
      name: 'BillList',
      component: BillList
    },
    {
      path: '/tasks',
      name: 'TaskLog',
      component: TaskLog
    }
  ]
})
