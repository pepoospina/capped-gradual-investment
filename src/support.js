const getSortedElements = function (getLowestKeyMethod, getElementAtKeyMethod) {
  var array = []
  return new Promise(function (resolve, reject) {
    getLowestKeyMethod.call().then(
      function (key) {
        if (key > 0) {
          // console.log('first key: ' + key)
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
          amount: res[1],
          multiplier_micro: res[2],
          used: res[3],
          filled_micros: res[4],
          paid_micros: res[5]
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
