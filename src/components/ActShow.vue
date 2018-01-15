<template>
    <div v-if="actUpdate && textPrice" id="actDetail">
        <p style="text-align: center;font-weight: 700;font-size: 16px">АКТ № {{act.NAME}} от 23 мая 2017 г.
            <br>на выполнение
            <nobr>работ-услуг</nobr>
        </p>

        <p>Мы, нижеподписавшиеся, представитель ИСПОЛНИТЕЛЯ,
            с одной стороны и представитель ЗАКАЗЧИКА с другой стороны,
            составили настоящий акт в том, что ИСПОЛНИТЕЛЬ выполнил, а ЗАКАЗЧИК принял следующие работы:</p>

        <table cellpadding="0" cellspacing="0" style="margin: 0 -9px">
            <thead>
            <tr>
                <th>Наименование</th>
                <th>Цена</th>
                <th>
                    <nobr>Кол-во</nobr>
                </th>
                <th>Ед. изм.</th>
                <th>Сумма</th>
            </tr>
            <tr>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row) in act.PROPERTY_VALUES.products">
                <td>{{row.name}}</td>
                <td>{{row.price}}</td>
                <td>{{row.quantity}}</td>
                <td>{{row.unit}}</td>
                <td>{{row.total}}</td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="4">Итого:</td>
                <td>{{act.PROPERTY_VALUES.price}}</td>
            </tr>
            </tfoot>
        </table>

        <p style="margin-top: 5px">Сумма прописью: {{textPrice}} 00 копеек. Без НДС.</p>

        <p>Работы выполнены в полном объеме, в установленные сроки и с надлежащим качеством.
            Стороны претензий друг к другу не имеют.</p>

        <table cellpadding="0" cellspacing="0" class="white">
            <tr>
                <td width="50%" valign="top">
                    <div>Исполнитель: {{from.RQ_COMPANY_NAME || from.NAME}}</div>
                    <div v-for="(name, key) in params" v-if="value=from[key]">{{name}}: {{value}}</div>
                </td>
                <td width="50%" valign="top">
                    <div>Заказчик: {{to.RQ_COMPANY_NAME || to.NAME}}</div>
                    <div v-for="(name, key) in params" v-if="value=to[key]">{{name}}: {{value}}</div>
                </td>
            </tr>
            <tr>
                <td>Сдал</td>
                <td>Принял</td>
            </tr>
        </table>
    </div>
</template>

<script>
  import BX from '../services/BXService'
  import number2Text from '../functions/number2Text.js'

  export default {
    template: 'act-show',
    name: 'ActShow',
    props: ['id'],
    data () {
      return {
        act: {},
        params: {
          get: 'Адрес',
          RQ_INN: 'ИНН',
          RQ_KPP: 'КПП',
          bill: 'Расчетный счет',
          bank: 'Банк',
          bik: 'БИК'
        },
        requisites: {}
      }
    },
    methods: {
      getCompanies (ids) {
        return BX.get('crm.requisite.list', {
          filter: {ENTITY_ID: ids, ENTITY_TYPE_ID: 4}
        }).then(result =>{
          result.forEach(row => {
            this.requisites[row.ENTITY_ID] = row
          })
          console.log(this.requisites)
        })
      }
    },
    computed: {
      from () {
        return this.requisites[this.act.PROPERTY_VALUES.companyFrom] || {}
      },
      to () {
        return this.requisites[this.act.PROPERTY_VALUES.companyTo] || {}
      },
      textPrice () {
        let total = this.act.ID ? this.act.PROPERTY_VALUES.price : false
        if (!total) {
          return false
        }
        let text = number2Text()(total, 'рубл|ь|я|ей')
        return text[0].toUpperCase() + text.substr(1)
      },
      actUpdate () {
        if (this.id) {
          BX.get('entity.item.get', {
            ENTITY: 'actList',
            FILTER: {ID: this.id}
          }).then(result => {
            let data = result[0]
            data.PROPERTY_VALUES.products = JSON.parse(data.PROPERTY_VALUES.products)

            this.getCompanies([data.PROPERTY_VALUES.companyTo, data.PROPERTY_VALUES.companyFrom]).then(_ => {
              this.act = data
              this.$forceUpdate
            })
          })
        }
        return true
      }
    },
    created () {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    #actDetail {
        margin: 0 10px;
        font-size: 14px;
    }

    * {
        color: black
    }

    table {
        border: 1px solid black;
        tr {
            background: white;
        }
        td,th {
            border: 1px solid black
        }
        thead {
            border-left: 1px solid black;

            tr {
            }
            td, th {
                text-align: center;
            }
        }
        tbody {
            td {
                border-left: none;
                text-align: right;
                &:first-child {
                    border: 1px solid black;
                    text-align: left;
                }
            }
        }
        tfoot {
            tr {
            }
            td {
                text-align: right;
                &:first-child {
                    text-align: left;
                }
            }
        }
        &.white {
            border: none;
            margin: 0 30px;
            * {
                text-align: left;
                border: none;
                padding: 0;
            }
        }
    }


</style>
