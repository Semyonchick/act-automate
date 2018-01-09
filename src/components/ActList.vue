<template>
    <div class="bills">
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

            <div class="medium-5 cell">
                <a href="/#/act" class="button float-right">Добавить акт</a>
            </div>
        </div>

        <table>
            <thead>
            <tr>
                <th>Дата выставления</th>
                <th>#</th>
                <th>Сумма</th>
                <th>Кому</th>
                <th>От кого</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in acts">
                <td>{{(new Date(row.DATE_ACTIVE_FROM)).toLocaleDateString()}}</td>
                <td>{{row.NAME}}</td>
                <td>{{calcTotal(row)}}</td>
                <td>
                    <div class="company" v-if="value=companies[row.PROPERTY_VALUES.companyTo]">{{value}}</div>
                </td>
                <td>
                    <div class="my-company" v-if="value=companies[row.PROPERTY_VALUES.companyFrom]">{{value}}</div>
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
        companies: {},
        filter: {}
      }
    },
    methods: {
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
        BX.get('entity.add', {
          ENTITY: 'actList',
          NAME: 'Список актов'
        }).then(_ => {
          BX.get('entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'bill', NAME: 'Счет', TYPE: 'N'})
          BX.get('entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'deal', NAME: 'Сделка', TYPE: 'N'})
          BX.get('entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'companyTo', NAME: 'Заказчик', TYPE: 'N'})
          BX.get('entity.item.property.add', {
            ENTITY: 'actList',
            PROPERTY: 'companyFrom',
            NAME: 'Исполнитель',
            TYPE: 'N'
          })
          BX.get('entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'products', NAME: 'Товары', TYPE: 'S'})

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
