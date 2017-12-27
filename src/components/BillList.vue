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
                        <option value="">123</option>
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
        let data = []
        let filter = {}
        // eslint-disable-next-line
        BX24.callMethod('crm.invoice.list', {filter: filter}, request => {
          if (request.error()) {
            alert(request.error())
          } else {
            data = data.concat(request.answer.result)
            if (request.answer.next) request.next()
            else this.updateData(data)
            console.log(data)
          }
        })
      },
      updateData (data) {
        this.bills = data

        let contacts = [...new Set(data.filter(value => value.UF_CONTACT_ID).map(value => value.UF_CONTACT_ID))].filter(id => !this.contacts[id])
        // eslint-disable-next-line
        BX24.callMethod('crm.contact.list', {filter: {ID: contacts}, select: ['ID', 'NAME', 'LAST_NAME']}, request => {
          request.answer.result.forEach(row => { this.contacts[row.ID] = [row.LAST_NAME, row.NAME].join(' ').trim() })
          if (request.answer.next) request.next()
        })
        let companies = [...new Set(data.filter(value => value.UF_COMPANY_ID).map(value => value.UF_COMPANY_ID).concat(data.map(value => value.UF_MYCOMPANY_ID)))].filter(id => !this.companies[id])
        // eslint-disable-next-line
        BX24.callMethod('crm.company.list', {filter: {ID: companies}, select: ['ID', 'TITLE']}, request => {
          request.answer.result.forEach(row => { this.companies[row.ID] = row.TITLE })
          if (request.answer.next) request.next()
        })
      }
    },
    computed: {},
    created: function () {
      this.getBills()

      // eslint-disable-next-line
      BX24.callMethod('crm.invoice.status.list', {select: ['STATUS_ID', 'NAME']}, request => {
        request.answer.result.forEach(row => { this.statuses[row.STATUS_ID] = row.NAME })
        if (request.answer.next) request.next()
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
