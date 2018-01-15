export default () => {
  let dictionary = [
    ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
      'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
      'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'],
    ['', 'десять', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'],
    ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'],
    ['тысяч|а|и|', 'миллион||а|ов', 'миллиард||а|ов', 'триллион||а|ов']
  ]

  function getNumber (number, limit) {
    let temp = number.match(/^\d{1,3}([,|\s]\d{3})+/)
    if (temp) return temp[0].replace(/[,|\s]/g, '')
    temp = Math.abs(parseInt(number))
    if (temp > limit) return null
    return String(temp)
  }

  function setEnding (variants, number) {
    variants = variants.split('|')
    number = number.charAt(number.length - 2) === '1' ? null : number.charAt(number.length - 1)
    switch (number) {
      case '1':
        return variants[0] + variants[1]
      case '2':
      case '3':
      case '4':
        return variants[0] + variants[2]
      default:
        return variants[0] + variants[3]
    }
  }

  function getPostfix (postfix, number) {
    if (typeof postfix === 'string' || postfix instanceof String) {
      if (postfix.split('|').length < 3) return ' ' + postfix
      return ' ' + setEnding(postfix, number)
    }

    return ''
  }

  return function (number, postfix) {
    if (typeof number === 'undefined') {
      return '999' + new Array(dictionary[3].length + 1).join(' 999')
    }
    number = String(number)
    let minus = false
    number.replace(/^\s+/, '').replace(/^-\s*/, function () {
      minus = true
      return ''
    })
    number = getNumber(number, Number(new Array(dictionary[3].length + 2).join('999')))
    if (!number) return ''
    postfix = getPostfix(postfix, number)
    if (number === '0') return 'ноль' + postfix
    let position = number.length
    let i = 0
    let j = 0
    let result = []
    while (position--) {
      result.unshift(dictionary[i++][number.charAt(position)])
      if (i === 2 && number.charAt(position) === '1') {
        result.splice(0, 2, dictionary[0][number.substring(position, position + 2)])
      }
      if (i === 3 && position !== 0) {
        i = 0
        if (position > 3 && number.substring(position - 3, position) === '000') {
          j++
          continue
        }

        result.unshift(setEnding(dictionary[3][j++], number.substring(0, position)))
      }
    }

    position = result.length - 5
    switch (result[position]) {
      case 'один':
        result[position] = 'одна'
        break
      case 'два':
        result[position] = 'две'
        break
    }

    if (minus) result.unshift('минус')
    return result.join(' ').replace(/\s+$/, '').replace(/\s+/g, ' ') + postfix
  }
}
