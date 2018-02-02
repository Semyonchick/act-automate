<template>
    <div class="bills">
        <date-select></date-select>

        <table>
            <thead>
            <tr>
                <th></th>
                <th>#</th>
                <th>Заголовок</th>
                <th>Дата выставления</th>
                <th>Дата оплаты</th>
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
                <td><a :href="domain+'/crm/invoice/show/'+row.ID+'/'" @click.stop
                       target="_blank">{{row.ACCOUNT_NUMBER}}</a></td>
                <td>{{row.ORDER_TOPIC}}</td>
                <td>{{(new Date(row.DATE_BILL)).toLocaleDateString()}}</td>
                <td>{{row.DATE_PAYED?(new Date(row.DATE_PAYED)).toLocaleDateString():''}}</td>
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
  import DateSelect from '@/components/DateSelect'

  export default {
    name: 'BillList',
    components: {DateSelect},
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
                DATE_ACTIVE_FROM: bill.DATE_PAYED > bill.DATE_BILL ? bill.DATE_PAYED : bill.DATE_BILL,
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
              location.href = '#/acts'
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
        if (this.date) {
          filter['>=DATE_INSERT'] = this.date.dateFrom
          filter['<=DATE_INSERT'] = this.date.dateTo
        }
        BX.get('crm.invoice.list', {filter: filter}).then(data => {
          this.updateData(data)
        })
      },
      updateData (data) {
        this.bills = data

        BX.get('entity.item.get', {ENTITY: 'actList', PROPERTY_bill: this.bills.map(row => row.ID)}).then(data => {
          this.actExists = data.map(row => row.PROPERTY_VALUES.bill)
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
      date () {
        return this.$children[0]
      },
      domain () {
        return 'http://' + BX.domain()
      }
    },
    created: function () {
      this.$nextTick(_ => {
        this.getBills()
      })

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
