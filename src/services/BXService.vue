<script>
  /* eslint-disable */

  export default {
    domain () {
      return BX24.getAuth().domain
    },
    get (method, params, next) {
      return new Promise((resolve, reject) => {
        let data = []
        BX24.callMethod(method, params, (request) => {
          if (request.error()) {
            reject(request.error())
          } else {
            data = data.concat(request.answer.result)
            if (request.answer.next && (!next || next(data))) request.next()
            else resolve(data)
          }
        })
      })
    },
    batch (methods) {
      return new Promise((resolve) => {
        BX24.callBatch(methods, (request) => {
          resolve(request.map(row => row.answer.result).filter(row => row))
        })
      })
    }
  }
</script>