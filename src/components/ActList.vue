<template>
    <div class="acts">
        <div class="grid-x">
            <div class="medium-7 cell">
                <div class="input-group">
                    <label for="from" class="input-group-label">с</label>
                    <input id="from" type="date" class="input-group-field" v-model="filter.DATE_FROM"
                           @change="getActs()">

                    <label for="to" class="input-group-label">до</label>
                    <input id="to" type="date" class="input-group-field" v-model="filter.DATE_TO" @change="getActs()">
                </div>
            </div>

            <div class="medium-5 cell" style="text-align: right">
                <a href="/#/bills" class="button ">Акты по счетам</a>
                <a href="/#/act" class="button">Добавить акт</a>
            </div>
        </div>

        <table>
            <thead>
            <tr>
                <th></th>
                <th>Дата выставления</th>
                <th>#</th>
                <th>Сумма</th>
                <th>Кому</th>
                <th>От кого</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in acts" :class="{selected: select.indexOf(row.ID)+1}" @click="rowClick(row.ID)">
                <td><label><input type="checkbox" v-model="select" :value="row.ID" @click.prevent></label></td>
                <td>{{(new Date(row.DATE_ACTIVE_FROM)).toLocaleDateString()}}</td>
                <td>{{row.NAME}}</td>
                <td>{{row.PROPERTY_VALUES.price}}</td>
                <td>
                    <div class="company" v-if="value=companies[row.PROPERTY_VALUES.companyTo]">{{value}}</div>
                </td>
                <td>
                    <div class="my-company" v-if="value=companies[row.PROPERTY_VALUES.companyFrom]">{{value}}</div>
                </td>
                <td>
                    <button type="button" @click="printAct(row.ID)">print</button>
                    <button type="button" @click="editAct(row.ID)">edit</button>
                    <button type="button" @click="removeAct(row.ID)">delete</button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
  import BX from '../services/BXService'

  export default {
    name: 'ActList',
    data () {
      return {
        acts: [],
        select: [],
        companies: {},
        filter: {}
      }
    },
    methods: {
      printAct (id) {
        alert('Печать https://github.com/MrRio/jsPDF')
      },
      editAct (id) {
        location.href = '/#/act/' + id
      },
      removeAct (id) {
        if (confirm('Вы уверены что хотите удалить этот акт?')) {
          BX.get('entity.item.delete', {ENTITY: 'actList', ID: id})
          this.acts = this.acts.filter(row => row.ID !== id)
        }
      },
      rowClick (id) {
        let exist = this.select.indexOf(id)
        if (exist + 1) {
          this.select.splice(exist, 1)
        } else {
          this.select.push(id)
        }
      },
      calcTotal (row) {
        let total = 0
        try {
          let data = JSON.parse(row.PROPERTY_VALUES.products) || []
          data.forEach(row => {
            total += row.total
          })
        } catch (e) {}
        return total
      },
      getActs () {
        let filter = {}
        BX.get('entity.item.get', {ENTITY: 'actList', FILTER: filter, SORT: {ID: 'DESC'}}).then(data => {
          this.updateData(data)
        })
      },
      updateData (data) {
        this.acts = data
        let companies = [...new Set(data.map(value => value.PROPERTY_VALUES.companyFrom).concat(data.map(value => value.PROPERTY_VALUES.companyTo)))].filter(id => !this.companies[id])
        if (companies.length) {
          BX.get('crm.company.list', {
            filter: {ID: companies},
            select: ['ID', 'TITLE']
          }).then(data => {
            data.forEach(row => {
              this.companies[row.ID] = row.TITLE
            })
            this.$forceUpdate()
          })
        } else {
          this.$forceUpdate()
        }
      },
      install () {
        this.remove()
        BX.batch([
          ['entity.add', {ENTITY: 'actList', NAME: 'Список актов'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'bill', NAME: 'Счет', TYPE: 'N'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'deal', NAME: 'Сделка', TYPE: 'N'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'price', NAME: 'Сумма', TYPE: 'N'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'companyTo', NAME: 'Заказчик', TYPE: 'N'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'companyFrom', NAME: 'Исполнитель', TYPE: 'N'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'products', NAME: 'Товары', TYPE: 'S'}]
        ]).then(_ => {
          this.getActs()
        })
      },
      remove () {
        BX.get('entity.delete', {ENTITY: 'actList'})
      }
    },
    computed: {},
    created () {
      BX.get('entity.get', {ENTITY: 'actList'}).then(_ => this.getActs()).catch(_ => this.install())
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
