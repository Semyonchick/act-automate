<script>
  /* eslint-disable */
  export default {
    cache: false,
    domain () {
      return BX24.getAuth().domain
    },
    get (method, params, next) {
      const cacheId = method + '-' + JSON.stringify([params, next])

      return new Promise((resolve, reject) => {
        if (this.cache && sessionStorage.getItem(cacheId)) {
          resolve(JSON.parse(sessionStorage.getItem(cacheId)))
        } else {
          let data = []
          BX24.callMethod(method, params, (request) => {
            if (request.error()) {
              reject(request.error())
            } else {
              data = data.concat(request.answer.result)
              if (request.answer.next && (!next || next(data))){
                setTimeout(_ => {request.next()}, 100)
              }
              else {
                if (this.cache && method.match(/\.(get|list)$/)) {
                  sessionStorage.setItem(cacheId, JSON.stringify(data))
                }
                resolve(data)
              }
            }
          })
        }
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