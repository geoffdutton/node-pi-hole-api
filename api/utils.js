
const floatRegex = /^-?\d+(?:[.,]\d*?)?$/

function isFloat (val) {
  if (!floatRegex.test(val)) { return false }

  val = parseFloat(val)
  return !isNaN(val)
}

const intRegex = /^-?\d+$/

function isInt (val) {
  if (!intRegex.test(val)) { return false }

  const intVal = parseInt(val, 10)
  return parseFloat(val) === intVal && !isNaN(intVal)
}

function parseStringNumber (val) {
  if (isFloat(val)) {
    return parseFloat(val)
  }

  if (isInt(val)) {
    return parseInt(val, 10)
  }

  return val
}

module.exports = {
  isFloat,
  isInt,
  parseStringNumber
}
