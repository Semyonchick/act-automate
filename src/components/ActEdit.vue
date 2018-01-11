<template>
    <div class="act">
        <h1>Сформировать акт</h1>

        <form action="" @submit.prevent="addAct($event)">
            <div class="grid-x">
                <div class="medium-2 cell"><label for="number">Номер</label></div>
                <div class="medium-2 cell"><input id="number" type="text" v-model="act.NAME"></div>
            </div>
            <div class="grid-x">
                <div class="medium-2 cell"><label for="date">Дата</label></div>
                <div class="medium-2 cell"><input id="date" type="date" v-model="act.DATE_ACTIVE_FROM"></div>
            </div>
            <div class="grid-x">
                <div class="medium-2 cell"><label for="sale">Продавец</label></div>
                <div class="medium-3 cell">
                    <select id="sale" v-model="act.PROPERTY_VALUES.companyFrom">
                        <option v-for="(value,key) in companies" :value="key">{{value}}</option>
                    </select>
                </div>
            </div>
            <div class="grid-x">
                <div class="medium-2 cell"><label for="buy">Покупатель</label></div>
                <div class="medium-3 cell">
                    <select id="buy" v-model="act.PROPERTY_VALUES.companyTo"
                            @click="selectCompany('PROPERTY_VALUES.companyTo')">
                        <option :value="companyTo.id">{{companyTo.title}}</option>
                    </select>
                </div>
            </div>
            <div class="grid-x">
                <div class="medium-2 cell"><label for="description">Примечание</label></div>
                <div class="medium-6 cell"><textarea id="description" v-model="act.PREVIEW_TEXT"></textarea></div>
            </div>


            <table>
                <thead>
                <tr>
                    <th width="20px"></th>
                    <th width="30%">Наименование</th>
                    <th>Цена (руб.)</th>
                    <th>Кол-во</th>
                    <th>Ед. измерения</th>
                    <th>Итого</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(row, i) in act.PROPERTY_VALUES.products">
                    <td>{{i + 1}}.</td>
                    <td><input type="text" v-model="row.name"></td>
                    <td><input type="text" v-model="row.price" @input="calc(i, 'price')" @change="valid(i, 'price')">
                    </td>
                    <td><input type="text" v-model="row.quantity" @input="calc(i, 'quantity')"
                               @change="valid(i, 'quantity')"></td>
                    <td><input type="text" v-model="row.unit"></td>
                    <td><input type="text" v-model="row.total" @input="calc(i, 'total')" @change="valid(i, 'total')">
                    </td>
                    <td><a href="javascript:void(0)" @click="removeProduct(i)">&times;</a></td>
                </tr>
                </tbody>
            </table>
            <div>
                <a href="javascript:void(0)" @click="addProduct()">вставить строку</a>
            </div>

            <div>
                <button type="submit">
                    <template v-if="act.ID">Сохранить</template>
                    <template v-else>Добавить</template>
                </button>
            </div>
        </form>
    </div>
</template>

<script>
  import BX from '../services/BXService'

  export default {
    name: 'ActEdit',
    data () {
      return {
        act: {
          DATE_ACTIVE_FROM: [(new Date()).getFullYear(), ('0' + ((new Date()).getMonth() + 1)).substr(-2), ('0' + (new Date()).getDate()).substr(-2)].join('-'),
          PROPERTY_VALUES: {}
        },
        companyTo: {},
        companies: {}
      }
    },
    methods: {
      addAct (event) {
        let params = Object.assign({ENTITY: 'actList'}, this.act)
        params.PROPERTY_VALUES.price = params.PROPERTY_VALUES.products.map(row => row.total).reduce((a, b) => a + b)
        params.PROPERTY_VALUES.products = JSON.stringify(params.PROPERTY_VALUES.products)
        if (this.act.ID) {
          BX.get('entity.item.update', params).then(_ => {
            location.href = '/#/acts'
          })
        } else {
          BX.get('entity.item.add', params).then(_ => {
          })
        }
        this.act = {}
      },
      addProduct () {
        if (!this.act.PROPERTY_VALUES.products) this.act.PROPERTY_VALUES.products = []
        this.act.PROPERTY_VALUES.products.push({})
        this.$forceUpdate()
      },
      calc (i, field) {
        let value = this.valid(i, field, true)
        if (!this.act.PROPERTY_VALUES.products[i]['quantity']) {
          this.act.PROPERTY_VALUES.products[i]['quantity'] = 1
        }
        if (field === 'price') {
          this.act.PROPERTY_VALUES.products[i]['total'] = value * this.act.PROPERTY_VALUES.products[i]['quantity'] || 0
        } else if (field === 'quantity') {
          this.act.PROPERTY_VALUES.products[i]['total'] = value * this.act.PROPERTY_VALUES.products[i]['price'] || 0
        } else if (field === 'total') {
          this.act.PROPERTY_VALUES.products[i]['price'] = (value / this.act.PROPERTY_VALUES.products[i]['quantity']).toFixed(2) || 0
        }
        this.$forceUpdate()
      },
      valid (i, field, notChange) {
        let value = this.act.PROPERTY_VALUES.products[i][field]
        value = parseFloat(value)
        if (notChange) {
          return value
        } else {
          if (field === 'price') this.act.PROPERTY_VALUES.products[i][field] = value.toFixed(2)
          this.$forceUpdate()
        }
        return false
      },
      removeProduct (i) {
        this.act.PROPERTY_VALUES.products.splice(i, 1)
        this.$forceUpdate()
      },
      selectCompany (field) {
        // eslint-disable-next-line
        BX24.selectCRM({
          entityType: ['company']
        }, data => {
          this.companyTo = data.company[0]
          this.companyTo.id = this.companyTo.id.split('_')[1]
          this.act[field] = this.companyTo.id
          this.$forceUpdate()
        })
        return false
      }
    },
    computed: {},
    created () {
      if (this.$route.params.id) {
        BX.get('entity.item.get', {ENTITY: 'actList', FILTER: {ID: this.$route.params.id}}).then(data => {
          this.act = data[0]
          this.act.DATE_ACTIVE_FROM = this.act.DATE_ACTIVE_FROM.split('T')[0]
          this.act.PROPERTY_VALUES.products = JSON.parse(this.act.PROPERTY_VALUES.products)
          BX.get('crm.company.list', {
            filter: {ID: this.act.PROPERTY_VALUES.companyTo},
            select: ['ID', 'TITLE']
          }).then(data => {
            this.companyTo = {
              id: data[0].ID,
              title: data[0].TITLE
            }
            this.$forceUpdate()
          })
        })
      } else {
        let date = new Date()
        this.act.DATE_ACTIVE_FROM = [date.getFullYear(), ('0' + (date.getMonth() + 1)).substr(-2), ('0' + date.getDate()).substr(-2)].join('-')
        this.addProduct()
      }

      BX.get('crm.company.list', {
        filter: {IS_MY_COMPANY: 'Y'},
        select: ['ID', 'TITLE']
      }).then(data => {
        data.forEach(row => {
          this.companies[row.ID] = row.TITLE
        })
        if (!this.act.PROPERTY_VALUES.companyFrom) {
          this.act.PROPERTY_VALUES.companyFrom = data[0].ID
        }
        this.$forceUpdate()
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
