<template>
    <div v-if="actUpdate && act && textPrice" id="actDetail">
        <p style="text-align: center;font-weight: 700">АКТ № {{act.NAME}} от {{getDate(act.DATE_ACTIVE_FROM)}}
            <br>на выполнение
            <nobr>работ-услуг</nobr>
        </p>

        <p v-if="act.PREVIEW_TEXT" v-html="act.PREVIEW_TEXT"></p>

        <p>Мы, нижеподписавшиеся, представитель ИСПОЛНИТЕЛЯ,
            с одной стороны и представитель ЗАКАЗЧИКА с другой стороны,
            составили настоящий акт в том, что ИСПОЛНИТЕЛЬ выполнил, а ЗАКАЗЧИК принял следующие работы:</p>

        <table cellpadding="0" cellspacing="0" style="margin: 0 -7px">
            <thead>
            <tr>
                <th>Наименование</th>
                <th width="80px">Цена</th>
                <th width="60px">
                    <nobr>Кол-во</nobr>
                </th>
                <th width="60px">Ед. изм.</th>
                <th width="100px">Сумма</th>
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
                <td>{{getPriceFormat(row.price)}}</td>
                <td>{{parseFloat(row.quantity)}}</td>
                <td>{{row.unit}}</td>
                <td>{{getPriceFormat(row.total)}}</td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="4">Итого:</td>
                <td>{{getPriceFormat(act.PROPERTY_VALUES.price)}}</td>
            </tr>
            </tfoot>
        </table>

        <div style="margin: 5px 0 15px">Сумма прописью: {{textPrice}} 00 копеек. Без НДС.</div>

        <div style="margin: 30px 0">Работы выполнены в полном объеме, в установленные сроки и с надлежащим качеством.
            Стороны претензий друг к другу не имеют.
        </div>

        <table cellpadding="0" cellspacing="0" class="white">
            <tr>
                <td width="50%" valign="top">
                    <div>Исполнитель: {{getName(from)}}</div>
                    <div v-for="(name, key) in params" v-if="value=from[key]">{{name}}: {{value}}</div>
                </td>
                <td width="50%" valign="top">
                    <div>Заказчик: {{getName(to)}}</div>
                    <div v-for="(name, key) in params" v-if="value=to[key]">{{name}}: {{value}}</div>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 5px">Сдал _____________</td>
                <td style="padding-top: 5px">Принял _____________</td>
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
          RQ_ACC_NUM: 'Расчетный счет',
          RQ_COR_ACC_NUM: 'Кор. счет',
          RQ_BANK_NAME: 'Банк',
          RQ_BIK: 'БИК'
        },
        requisites: {}
      }
    },
    methods: {
      getDate (text) {
        let date = new Date(text)
        return date.toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      getName (data) {
        return data.RQ_COMPANY_NAME || [data.PRESET_ID === '4' ? 'ИП' : '', data.RQ_LAST_NAME, data.RQ_FIRST_NAME, data.RQ_SECOND_NAME].filter(value => value).join(' ')
      },
      getPriceFormat (price) {
        return parseFloat(price).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1 ').replace('.', ',')
      },
      getCompanies (ids) {
        return new Promise(resolve => {
          BX.get('crm.requisite.list', {
            filter: {ENTITY_ID: ids, ENTITY_TYPE_ID: 4}
          }).then(result => {
            BX.get('crm.requisite.bankdetail.list', {
              filter: {ENTITY_ID: result.map(row => row.ID)}
            }).then(data => {
              result.forEach(row => {
                let rq = data.filter(rq => rq.ENTITY_ID === row.ID)[0]
                for (let key in rq) {
                  if (key.indexOf('RQ_') === 0) {
                    row[key] = rq[key]
                  }
                }
                this.requisites[row.ENTITY_ID] = row
              })
              console.log(this.requisites)
              resolve(this.requisites)
            })
          })
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
        margin: 0 10px 0 25px;
        font-size: 13.5px;
        line-height: 1.2;
    }

    p {
        text-indent: 25px
    }

    * {
        color: black
    }

    table {
        border: 1px solid black;
        tr {
            background: white;
        }
        td, th {
            border: 1px solid black;
            padding: 2px 5px;
        }
        thead {
            border-left: 1px solid black;

            tr {
            }
            td, th {
                padding: 7px;
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
