<template>
    <div class="act">
        <h1>Сформировать акт</h1>

        <form action="" @submit="addAct($event)">
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
                    <select id="sale" v-model="act.PROPERTY_companyFrom">
                        <option v-for="(value, key) in companies" :value="key">{{value}}</option>
                    </select>
                </div>
            </div>
            <div class="grid-x">
                <div class="medium-2 cell"><label for="buy">Покупатель</label></div>
                <div class="medium-3 cell">
                    <select id="buy" v-model="act.PROPERTY_companyTo" @click="selectCompany('PROPERTY_companyTo')">
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
                <tr v-for="(row, i) in act.PROPERTY_products">
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
                <button type="submit">Добавить</button>
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
          DATE_ACTIVE_FROM: [(new Date()).getFullYear(), ('0' + ((new Date()).getMonth() + 1)).substr(-2), ('0' + (new Date()).getDate()).substr(-2)].join('-')
        },
        companyTo: {},
        companies: {}
      }
    },
    methods: {
      addAct (event) {
        event.preventDefault()

        let params = {ENTITY: 'actList', PROPERTY_VALUES: {}}
        for (let i in this.act) {
          if (i.indexOf('PROPERTY_') === 0) {
            let key = i.replace('PROPERTY_', '')
            params['PROPERTY_VALUES'][key] = key === 'products' ? JSON.stringify(this.act[i]) : this.act[i]
          } else {
            params[i] = this.act[i]
          }
        }
        BX.get('entity.item.add', params).then(_ => {
          location.href = '/#/acts'
        })
        return false
      },
      addProduct () {
        if (!this.act['PROPERTY_products']) this.act['PROPERTY_products'] = []
        this.act['PROPERTY_products'].push({})
        this.$forceUpdate()
      },
      calc (i, field) {
        let value = this.valid(i, field, true)
        if (!this.act['PROPERTY_products'][i]['quantity']) {
          this.act['PROPERTY_products'][i]['quantity'] = 1
        }
        if (field === 'price') {
          this.act['PROPERTY_products'][i]['total'] = value * this.act['PROPERTY_products'][i]['quantity'] || 0
        } else if (field === 'quantity') {
          this.act['PROPERTY_products'][i]['total'] = value * this.act['PROPERTY_products'][i]['price'] || 0
        } else if (field === 'total') {
          this.act['PROPERTY_products'][i]['price'] = (value / this.act['PROPERTY_products'][i]['quantity']).toFixed(2) || 0
        }
        this.$forceUpdate()
      },
      valid (i, field, notChange) {
        let value = this.act['PROPERTY_products'][i][field]
        value = parseFloat(value)
        if (notChange) {
          return value
        } else {
          if (field === 'price') this.act['PROPERTY_products'][i][field] = value.toFixed(2)
          this.$forceUpdate()
        }
        return false
      },
      removeProduct (i) {
        this.act['PROPERTY_products'].splice(i, 1)
        this.$forceUpdate()
      },
      selectCompany (field) {
        BX24.selectCRM({
          entityType: ['company']
        }, data => {
          this.companyTo = data.company[0]
          this.companyTo.id = this.companyTo.id.split('_')[1]
          this.act[field] = this.companyTo.id
          this.$forceUpdate()
        })
        return false
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
      BX.get('crm.company.list', {
        filter: {IS_MY_COMPANY: 'Y'},
        select: ['ID', 'TITLE']
      }).then(data => {
        data.forEach(row => {
          this.companies[row.ID] = row.TITLE
        })
        this.act['PROPERTY_companyFrom'] = data[0].ID
        this.$forceUpdate()
      })

      let date = new Date()
      this.act.DATE_ACTIVE_FROM = [date.getFullYear(), ('0' + (date.getMonth() + 1)).substr(-2), ('0' + date.getDate()).substr(-2)].join('-')
      this.addProduct()

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
