<script>
  export default {
    get (method, params, next) {
      return new Promise((resolve, reject) => {
        let data = []
        // eslint-disable-next-line
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
    }
  }
</script>