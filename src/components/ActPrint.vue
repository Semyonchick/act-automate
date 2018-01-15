<template>
    <div>xxx</div>
</template>

<script>
  import BX from '../services/BXService'
  import jsPDF from 'jspdf'

  export default {
    name: 'ActPrint',
    data () {
      return {
        act: {},
        companies: {}
      }
    },
    methods: {
      createPdf () {
        // eslint-disable-next-line
        let doc = new jsPDF()

        doc.text('Hello world!', 10, 10)
        doc.autoPrint()

//        doc.save('a4.pdf')
      }
    },
    computed: {},
    created () {
      BX.get('entity.item.get', {
        ENTITY: 'actList',
        FILTER: {ID: this.$route.params.id}
      }).then(result => {
        let data = result[0]
        BX.get('crm.company.list', {
          filter: {ID: [data.PROPERTY_VALUES.companyTo, data.PROPERTY_VALUES.companyFrom]},
          select: ['ID', 'TITLE']
        }).then(result => result.forEach(row => {
          this.companies[row.ID] = row.TITLE
        })).then(_ => {
          this.act = data
        }).then(_ => {
          this.createPdf()
        })
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
