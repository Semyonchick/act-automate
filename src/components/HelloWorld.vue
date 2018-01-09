<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <ul>
      <li><a href="/#/acts">Акты</a></li>
      <li><a href="/#/bills">Счета</a></li>
      <li><a href="/#/tasks">Задачи</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Система автоматизации актов'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
