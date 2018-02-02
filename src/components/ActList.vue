<template>
    <div class="acts">
        <div v-if="currentId">
            <button @click="currentId=false">< back</button>
            <act-show ref="act" :id="currentId"></act-show>
        </div>
        <div v-else>
            <date-select></date-select>

            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Дата выставления</th>
                    <th>#</th>
                    <th>Сумма</th>
                    <th>Кому</th>
                    <th>От кого</th>
                    <th>Статус</th>
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
                        <span>{{getStatus(row)}}</span>
                    </td>
                    <td>
                        <button type="button" @click.prevent="showAct(row.ID)">show</button>
                        <button type="button" @click.prevent="createPdf(row.ID)">pdf</button>
                        <button type="button" @click.prevent="editAct(row.ID)">edit</button>
                        <button type="button" @click.prevent="removeAct(row.ID)">delete</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
  import BX from '../services/BXService'
  import html2pdf from 'html2pdf.js'
  import ActShow from '@/components/ActShow'
  import DateSelect from '@/components/DateSelect'

  export default {
    components: {ActShow, DateSelect},
    name: 'ActList',
    data () {
      return {
        acts: [],
        select: [],
        companies: {},
        filter: {},
        currentId: 0,
        statusMap: ['новый', 'отправлен', 'получен']
      }
    },
    methods: {
      getStatus (row) {
        return this.statusMap[+row.PROPERTY_VALUES.status || 0]
      },
      showAct (id) {
        this.currentId = id
      },
      createPdf (id) {
        this.currentId = id
        setTimeout(_ => {
          let element = document.getElementById('actDetail')
          html2pdf(element, {
            margin: 10,
            filename: 'act_' + this.currentId + '.pdf',
            image: {type: 'jpeg', quality: 0.98},
            html2canvas: {dpi: 384, letterRendering: true}
          })
          this.currentId = false
        }, 1000)
      },
      editAct (id) {
        location.href = '#/act/' + id
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
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'products', NAME: 'Товары', TYPE: 'S'}],
          ['entity.item.property.add', {ENTITY: 'actList', PROPERTY: 'status', NAME: 'Статус', TYPE: 'N'}]
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
