<template>
    <div class="bills">
        <div class="grid-x">
            <div class="large-7 cell">
                <div class="input-group">
                    <label for="from" class="input-group-label">с</label>
                    <input id="from" type="date" class="input-group-field" v-model="filter.DATE_FROM"
                           @change="getBills()">

                    <label for="to" class="input-group-label">до</label>
                    <input id="to" type="date" class="input-group-field" v-model="filter.DATE_TO" @change="getBills()">

                    <select name="" id="" v-model="filter.STATUS" size="1">
                        <option value=""></option>
                        <option v-for="(status, key) in statuses" :value="key">{{status}}</option>
                    </select>

                </div>
            </div>

            <div class="large-5 cell">
            </div>
        </div>

        <table>
            <thead>
            <tr>
                <th>Дата выставления</th>
                <th>#</th>
                <th>Заголовок</th>
                <th>Стоимость</th>
                <th>Статус</th>
                <th>Кому</th>
                <th>От кого</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="row in bills">
                <td>{{(new Date(row.DATE_BILL)).toLocaleDateString()}}</td>
                <td>{{row.ACCOUNT_NUMBER}}</td>
                <td>{{row.ORDER_TOPIC}}</td>
                <td>{{row.PRICE}}</td>
                <td>
                    <div class="status" v-if="value=statuses[row.STATUS_ID]">{{value}}</div>
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
    </div>
</template>

<script>
  import BX from '../services/BXService'

  export default {
    name: 'BillList',
    data () {
      return {
        bills: [],
        statuses: {},
        contacts: {},
        companies: {},
        filter: {}
      }
    },
    methods: {
      getBills: function () {
        let filter = {}
        BX.get('crm.invoice.list', {filter: filter}).then(data => {
          this.updateData(data)
        })
      },
      updateData (data) {
        this.bills = data

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
//            select: ['ID', 'TITLE']
          }).then(data => {
            data.forEach(row => {
              this.companies[row.ID] = row.TITLE
            })
            this.$forceUpdate()
          })
        }
      }
    },
    computed: {},
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
