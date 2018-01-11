<template>
    <div class="bills">
        <div class="grid-x">
            <div class="medium-7 cell">
                <div class="input-group">
                    <label for="from" class="input-group-label">с</label>
                    <input id="from" type="date" class="input-group-field" v-model="filter.DATE_FROM"
                           @change="getBills()">

                    <span class="space"></span>

                    <label for="to" class="input-group-label">до</label>
                    <input id="to" type="date" class="input-group-field" v-model="filter.DATE_TO" @change="getBills()">

                    <span class="space"></span>

                    <label for="status" class="input-group-label">статус</label>
                    <select id="status" v-model="filter.STATUS" size="1">
                        <option value=""></option>
                        <option v-for="(status, key) in statuses" :value="key">{{status}}</option>
                    </select>
                </div>
            </div>

            <div class="medium-5 cell" style="text-align: right">
                <a href="/#/acts" class="button">акты</a>
            </div>
        </div>

        <table>
            <thead>
            <tr>
                <th></th>
                <th>Дата выставления</th>
                <th>#</th>
                <th>Заголовок</th>
                <th>Стоимость</th>
                <th>Статус</th>
                <th></th>
                <th>Кому</th>
                <th>От кого</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in bills" :class="{selected: select.indexOf(row.ID)+1}" @click="rowClick(row.ID)">
                <td><label><input type="checkbox" v-model="select" :value="row.ID" @click.prevent></label></td>
                <td>{{(new Date(row.DATE_BILL)).toLocaleDateString()}}</td>
                <td><a :href="domain+'/crm/invoice/show/'+row.ID+'/'" @click.stop
                       target="_blank">{{row.ACCOUNT_NUMBER}}</a></td>
                <td>{{row.ORDER_TOPIC}}</td>
                <td>{{row.PRICE}}</td>
                <td>
                    <div class="status" v-if="value=statuses[row.STATUS_ID]">{{value}}</div>
                </td>
                <td>
                    <span v-if="actExists.indexOf(row.ID)+1">+</span>
                    <span v-else>-</span>
                </td>
                <td>
                    <div class="company" v-if="value=companies[row.UF_COMPANY_ID]">{{value}}</div>
                    <div class="contact" v-if="value=contacts[row.UF_CONTACT_ID]">{{value}}</div>
                </td>
                <td>
                    <div class="my-company" v-if="value=companies[row.UF_MYCOMPANY_ID]">{{value}}</div>
                </td>
            </tr>
            </tbody>
        </table>

        <div v-if="select.length && calcFooterHeight()" class="fixed-footer">
            <div :style="{height: footerHeight + 'px'}"></div>
            <div class="content">
                <button type="button" class="button" @click="generateActs()">Сгенерировать</button>
            </div>
        </div>
    </div>
</template>

<script>
  import BX from '../services/BXService'

  export default {
    name: 'BillList',
    data () {
      return {
        bills: [],
        actExists: [],
        select: [],
        statuses: {},
        contacts: {},
        companies: {},
        filter: {},
        footerHeight: 0
      }
    },
    methods: {
      generateActs () {
        BX.get('entity.item.get', {ENTITY: 'actList', PROPERTY_bill: this.select}).then(data => {
          data.forEach(row => {
            let index = this.select.indexOf(row.PROPERTY_VALUES.bill)
            if (index + 1) this.select.splice(index, 1)
          })
        }).then(_ => {
          let calls = []
          this.select.forEach(id => {
            calls.push(['crm.invoice.get', {id: id}])
          })

          BX.batch(calls).then(result => {
            calls = []
            result.forEach(bill => {
              let params = {
                ENTITY: 'actList',
                NAME: bill.ACCOUNT_NUMBER,
                DATE_ACTIVE_FROM: bill.DATE_PAYED || bill.DATE_BILL,
                PREVIEW_TEXT: bill.COMMENTS,
                PROPERTY_VALUES: {
                  bill: bill.ID,
                  price: bill.PRICE,
                  companyFrom: bill.UF_MYCOMPANY_ID,
                  companyTo: bill.UF_COMPANY_ID,
                  products: JSON.stringify(bill.PRODUCT_ROWS.map(row => {
                    return {
                      name: row.PRODUCT_NAME,
                      price: row.PRICE,
                      quantity: +row.QUANTITY,
                      unit: row.MEASURE_NAME,
                      total: row.PRICE * row.QUANTITY
                    }
                  }))
                }
              }
              calls.push(['entity.item.add', params])
            })

            BX.batch(calls).then(_ => {
              location.href = '/#/acts'
            })
          })
        })
      },
      calcFooterHeight () {
        this.$nextTick(() => {
          let footer = document.querySelector('.fixed-footer .content')
          this.footerHeight = footer.clientHeight
        })
        return true
      },
      rowClick (id) {
        let exist = this.select.indexOf(id)
        if (exist + 1) {
          this.select.splice(exist, 1)
        } else {
          this.select.push(id)
        }
      },
      getBills: function () {
        let filter = {'!%ACCOUNT_NUMBER': '#'}
        BX.get('crm.invoice.list', {filter: filter}).then(data => {
          this.updateData(data)
        })
      },
      updateData (data) {
        this.bills = data

        BX.get('entity.item.get', {ENTITY: 'actList', PROPERTY_bill: this.bills.map(row => row.ID)}).then(data => {
          this.actExists = data.map(row => row.PROPERTY_VALUES.bill)
          console.log(this.actExists)
          this.$forceUpdate()
        })

        let contacts = [...new Set(data.filter(value => value.UF_CONTACT_ID).map(value => value.UF_CONTACT_ID))].filter(id => !this.contacts[id])
        if (contacts.length) {
          BX.get('crm.contact.list', {
            filter: {ID: contacts},
            select: ['ID', 'NAME', 'LAST_NAME']
          }).then(data => {
            data.forEach(row => { this.contacts[row.ID] = [row.LAST_NAME, row.NAME].join(' ').trim() })
            this.$forceUpdate()
          })
        }

        let companies = [...new Set(data.filter(value => value.UF_COMPANY_ID).map(value => value.UF_COMPANY_ID).concat(data.map(value => value.UF_MYCOMPANY_ID)))].filter(id => !this.companies[id])
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
        }
      }
    },
    computed: {
      domain () {
        return 'http://' + BX.domain()
      }
    },
    created: function () {
      this.getBills()

      BX.get('crm.invoice.status.list', {select: ['STATUS_ID', 'NAME']}).then(data => {
        data.forEach(row => { this.statuses[row.STATUS_ID] = row.NAME })
        this.$forceUpdate()
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
