<template>
  <div class="log">
    <div class="grid-x">
      <div class="cell medium-4">
        <rangedate-picker @selected="onDateSelected" i18n="EN" format="DD.MM.YYYY"
                          :initRange="{start:new Date().getTime(), end: new Date()}"></rangedate-picker>
      </div>
      <div class="cell medium-3">
        <select v-model="filter.USER" size="1">
          <option></option>
          <option v-for="row in users" :value="row" v-if="value=userList[row]">
            {{value.LAST_NAME}} {{value.NAME}}
          </option>
        </select>
      </div>
      <div class="cell medium-3">
        <select v-model="filter.PROJECT" size="1">
          <option></option>
          <option v-for="row in projects" :value="row">{{row}}</option>
        </select>
      </div>
      <div class="cell medium-2">
        <button type="button" v-if="!showWaka" @click="getWaka()">waka-extend</button>
        <button type="button" v-else @click="waka={}">git-log</button>
      </div>
    </div>

    <div v-if="0" class="grid-x">
      <div class="cell">
        <div class="input-group">
          <label for="from" class="input-group-label">с</label>
          <input style="max-width: 140px" id="from" type="date" class="input-group-field"
                 v-model="filter.DATE_FROM">

          <label for="to" class="input-group-label">до</label>
          <input style="max-width: 140px" id="to" type="date" class="input-group-field"
                 v-model="filter.DATE_TO">

          <select name="" id="user" v-model="filter.USER" size="1">
            <option></option>
            <option v-for="row in users" :value="row" v-if="value=userList[row]">
              {{value.LAST_NAME}} {{value.NAME}}
            </option>
          </select>

          <select name="" id="project" v-model="filter.PROJECT" size="1">
            <option></option>
            <option v-for="row in projects" :value="row">{{row}}</option>
          </select>

          <button type="button" v-if="!showWaka" @click="getWaka()">waka-extend</button>
          <button type="button" v-else @click="waka={}">git-log</button>
        </div>
      </div>
    </div>

    <table>
      <thead>
      <tr>
        <th style="width: 30px">#</th>
        <!--<th>Дата от</th>-->
        <th style="width: 70px">Дата</th>
        <th style="width: 150px">Пользователь</th>
        <th style="width: 150px">Проект</th>
        <th>Описание</th>
        <th style="width: 150px">Время</th>
      </tr>
      </thead>
      <tbody v-if="showWaka">
      <template v-for="(projects, user) in waka">
        <tr v-for="(row, project) in projects">
          <td>#</td>
          <td></td>
          <td><span v-if="value=userList[user]">{{value.LAST_NAME}} {{value.NAME}}</span></td>
          <td>{{project}}</td>
          <td></td>
          <td>{{Math.round(row / 36) / 100}}</td>
        </tr>
      </template>
      </tbody>
      <tbody v-else>
      <tr v-for="row in workHistory" v-if="row.duration">
        <td>{{row.id}}</td>
        <!--<td>{{row.date.split(' ')[0]}}</td>-->
        <td>{{row.lastDate.split(' ')[0]}}</td>
        <td><span v-if="value=userList[row.user]">{{value.LAST_NAME}} {{value.NAME}}</span></td>
        <td>{{row.project}}</td>
        <td>{{row.text}}</td>
        <td>{{Math.round(row.duration / 36) / 100}}</td>
      </tr>
      </tbody>
      <tfoot>
      <tr v-if="data = Object.values(workHistory)">
        <td></td>
        <!--<td></td>-->
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>
          <template v-if="data.length">{{count(data)}}</template>
        </td>
      </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
  import BX from '../services/BXService'
  import VueRangedatePicker from 'vue-rangedate-picker'

  export default {
    name: 'TaskLog',
    components: {
      'rangedate-picker': VueRangedatePicker
    },
    data() {
      return {
        git: [],
        waka: {},
        userList: {},
        filter: {},
        loading: false
      }
    },
    watch: {
      'filter.DATE_FROM'() {
        this.update()
      },
      'filter.DATE_TO'() {
        this.update()
      }
    },
    methods: {
      onDateSelected(value) {
        this.filter.DATE_FROM = value.start.toISOString().split('T')[0]
        this.filter.DATE_TO = value.end.toISOString().split('T')[0]
      },
      update() {
        if (this.loading) clearTimeout(this.loading)

        this.loading = setTimeout(_ => {
          this.getData()
        }, 10)
      },
      async getData() {
        this.git = []

        localStorage.setItem('fromDate', this.filter.DATE_FROM)
        if (this.filter.DATE_TO) {
          localStorage.setItem('toDate', this.filter.DATE_TO)
        }

        if (this.filter.DATE_FROM && this.filter.DATE_TO) {
          this.git = await BX.get('lists.element.get', {
            IBLOCK_TYPE_ID: 'lists',
            IBLOCK_ID: 37,
            ELEMENT_ORDER: {DATE_CREATE: 'asc'},
            FILTER: {
              '>=DATE_CREATE': this.filter.DATE_FROM.split('-').reverse().join('.'),
              '<=DATE_CREATE': this.filter.DATE_TO.split('-').reverse().join('.')
            }
          })
        }

        if (this.showWaka) this.getWaka()

        this.loading = false
      },
      async getWaka () {
        this.waka = {}
        if (this.loading) return
        let list = await BX.get('lists.element.get', {
          IBLOCK_TYPE_ID: 'lists',
          IBLOCK_ID: 35,
          ELEMENT_ORDER: {ID: 'asc'},
          FILTER: {
            '>=DATE_ACTIVE_TO': this.filter.DATE_FROM.split('-').reverse().join('.'),
            '<=DATE_ACTIVE_FROM': this.filter.DATE_TO.split('-').reverse().join('.')
          }
        })
        list.filter(row => this.wakaIds.indexOf(row.ID) === -1).forEach(row => {
          let user = Object.values(row.PROPERTY_133)[0]
          let project = Object.values(row.PROPERTY_137)[0]
          if (!this.waka[user]) this.$set(this.waka, user, {})
          if (!this.waka[user][project]) this.$set(this.waka[user], project, 0)
          this.waka[user][project] += parseInt(Object.values(row.PROPERTY_139)[0])
        })
      },
      count(data) {
        return Math.round(data.map(row => row.duration / 36 / 100).reduce((a, b) => a + b) * 10) / 10
      },
      readyDate(date) {
        if (!date) return new Date().getTime() / 1000
        return (new Date(date.split(' ')[0].split('.').reverse().join('-') + ' ' + (date.split(' ')[1] || '00:00:00'))).getTime() / 1000
      }
    },
    computed: {
      showWaka() {
        return Object.values(this.waka).length
      },
      wakaIds() {
        let list = []
        this.git.forEach(row => {
          if (row.PROPERTY_521) {
            Object.values(row.PROPERTY_521).forEach(value => {
              if (list.indexOf(value) === -1) list.push(value)
            })
          }
        })
        return list
      },
      projects() {
        return this.git.map(row => row.PROPERTY_141 ? Object.values(row.PROPERTY_141)[0] : row.NAME.split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i)
      },
      users() {
        return this.git.map(row => Object.values(row.PROPERTY_143)[0]).filter((v, i, a) => a.indexOf(v) === i)
      },
      workHistory() {
        let result = {}
        let git = this.git

        if (this.filter.USER) git = git.filter(row => this.filter.USER === Object.values(row.PROPERTY_143)[0])
        if (this.filter.PROJECT) git = git.filter(row => this.filter.PROJECT === row.PROPERTY_141 ? Object.values(row.PROPERTY_141)[0] : row.NAME.split(' ')[0])

        git.forEach(row => {
          if (row.PREVIEW_TEXT.indexOf('Merge remote-tracking') !== -1) return
          let data = {
            id: row.ID,
            date: row.DATE_CREATE,
            lastDate: row.DATE_CREATE,
            time: this.readyDate(row.DATE_CREATE),
            project: row.PROPERTY_141 ? Object.values(row.PROPERTY_141)[0] : row.NAME.split(' ')[0],
            text: row.PREVIEW_TEXT,
            user: row.PROPERTY_143 ? Object.values(row.PROPERTY_143)[0] : 0,
            duration: +Object.values(row.PROPERTY_179)[0],
            git: []
          }
          let resultKey = data.text + data.project + data.user
          if (result[resultKey]) {
            data = result[resultKey]
            data.duration += +Object.values(row.PROPERTY_179)[0]
          }
          data.git.push(data.lastDate = row.DATE_CREATE)

          if (this.readyDate(this.filter.DATE_FROM) <= data.time) {
            result[resultKey] = data
          }
        })

        if (this.filter.PROJECT) {
          result = Object.values(result).filter(row => row.project === this.filter.PROJECT)
        }

        return result
      }
    },
    created() {
      this.$set(this.filter, 'DATE_FROM', localStorage.getItem('fromDate') || [(new Date()).getFullYear(), ('0' + ((new Date()).getMonth() + 1)).substr(-2), '01'].join('-'))
      this.$set(this.filter, 'DATE_TO', localStorage.getItem('toDate') || [(new Date()).getFullYear(), ('0' + ((new Date()).getMonth() + 1)).substr(-2), ('0' + ((new Date()).getDay() + 1)).substr(-2)].join('-'))

      BX.get('user.get', {}).then(users => {
        users.forEach(row => {
          this.userList[row.ID] = row
        })
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
