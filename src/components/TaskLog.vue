<template>
    <div class="log">
        <div class="grid-x">
            <div class="large-7 cell">
                <div class="input-group">
                    <label for="from" class="input-group-label">с</label>
                    <input id="from" type="date" class="input-group-field" v-model="filter.DATE_FROM"
                           @change="getData()">

                    <label for="to" class="input-group-label">до</label>
                    <input id="to" type="date" class="input-group-field" v-model="filter.DATE_TO" @change="getData()">

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

                </div>
            </div>

            <div class="large-5 cell">
            </div>
        </div>

        <table>
            <thead>
            <tr>
                <th>#</th>
                <th>Дата от</th>
                <th>Дата до</th>
                <th>Пользователь</th>
                <th>Проект</th>
                <th>Время</th>
                <th>Описание</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in workHistory">
                <td>{{row.id}}</td>
                <td>{{row.date.split(' ')[0]}}</td>
                <td>{{row.lastDate.split(' ')[0]}}</td>
                <td><span v-if="value=userList[row.user]">{{value.LAST_NAME}} {{value.NAME}}</span></td>
                <td>{{row.project}}</td>
                <td>{{Math.round(row.duration / 36) / 100}}</td>
                <td>{{row.text}}</td>
            </tr>
            </tbody>
            <tfoot>
            <tr v-if="data = Object.values(workHistory)">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td v-if="data.length">{{Math.round(data.map(row => row.duration / 36 / 100).reduce((a,b) => a+b)*10)/10}}</td>
                <td></td>
            </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
  import BX from '../services/BXService'

  export default {
    name: 'TaskLog',
    data () {
      return {
        git: [],
        waka: [],
        userList: {},
        filter: {}
      }
    },
    methods: {
      readyDate (date) {
        return (new Date(date.split(' ')[0].split('.').reverse().join('-') + ' ' + (date.split(' ')[1] || '00:00:00'))).getTime() / 1000
      },
      getData: function () {
        let date = this.readyDate(this.filter.DATE_FROM)
        BX.get('lists.element.get', {
          IBLOCK_TYPE_ID: 'lists',
          IBLOCK_ID: 37,
          ELEMENT_ORDER: {ACTIVE_FROM: 'desc'}
        }, (git) => {
          console.log(git)
          return this.readyDate(git[git.length - 1].DATE_CREATE) >= date
        }).then(git => {
          this.git = git.reverse()
        })
      }
    },
    computed: {
      projects () {
        return this.git.map(row => row.PROPERTY_141 ? Object.values(row.PROPERTY_141)[0] : row.NAME.split(' ')[0]).filter((v, i, a) => a.indexOf(v) === i)
      },
      users () {
        return this.git.map(row => Object.values(row.PROPERTY_143)[0]).filter((v, i, a) => a.indexOf(v) === i)
      },
      workHistory () {
        sessionStorage.setItem('fromDate', this.filter.DATE_FROM)

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
    created () {
      this.filter.DATE_FROM = sessionStorage.getItem('fromDate') || [(new Date()).getFullYear(), ('0' + ((new Date()).getMonth() + 1)).substr(-2), '01'].join('-')
      BX.get('user.get', {}).then(users => {
        users.forEach(row => {
          this.userList[row.ID] = row
        })
      })

      this.getData()
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
