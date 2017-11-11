const BigNumber = require('bignumber.js')

const getSortedElements = function (getLowestKeyMethod, getElementAtKeyMethod) {
  var array = []
  return new Promise(function (resolve, reject) {
    getLowestKeyMethod.call().then(
      function (key) {
        // console.log('first key: ' + key)
        if (key > 0) {
          getSortedElementsRec(getElementAtKeyMethod, key, array).then(
            function (array) {
              resolve(array)
            })
        } else {
          resolve([])
        }
      })
  })
}

const getSortedElementsRec = function (getElementAtKeyMethod, key, array) {
  return new Promise(function (resolve, reject) {
    getElementAtKeyMethod.call(key).then(
      function (res) {
        var element = {
          investor: res[0],
          amount: new BigNumber(res[1]),
          multiplier_micro: new BigNumber(res[2]),
          used: new BigNumber(res[3]),
          filled_micros: new BigNumber(res[4]),
          paid_micros: new BigNumber(res[5]),
          key: key
        }

        array.push(element)
        // console.log('array: ' + array)

        var nextKey = res[6]
        // console.log('nextKey: ' + nextKey)

        if (nextKey.toString() !== '0') {
          /* recursive call filling sortedOffers
          until the end of the list */
          resolve(getSortedElementsRec(getElementAtKeyMethod, nextKey, array))
        } else {
          resolve(array)
        }
      })
  })
}

export {
  getSortedElements
}
