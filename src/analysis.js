
const { getTrips, getDriver } = require("api");
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  // Your code goes here
  const allTrips = await getTrips()
  const randomDriver = {}

  // Fetch all the drivers and their details
  await Promise.allSettled(allTrips.map(e => getDriver(e.driverID).then(result =>
    randomDriver[e.driverID] = result
  )))

  const allDrivers = {}
  let tempAmount = 0
  let maxAmount = 0
  let minTripNo = 0
  let maxTripNo = 0
  let keys = []
  for (let trip of allTrips) { keys.push(trip.driverID) }
  keys = [...new Set(keys)]

  
  for (const id in keys) {
    for (const details in randomDriver) {
      if (keys[id] === details) allDrivers[keys[id]] = randomDriver[details]
    }
  }
  // Output structure
  const obj = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0,
    noOfDriversWithMoreThanOneVehicle: 0,
    mostTripsByDriver: {
      name: '',
      email: '',
      phone: '',
      noOfTrips: 0,
      totalAmountEarned: 0
    },
    highestEarningDriver: {
      name: '',
      email: '',
      phone: '',
      noOfTrips: 0,
      totalAmountEarned: 0
    }
  }
  // Calculate billed total, non cash trips and cash trips
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].isCash === true) {
      obj.noOfCashTrips++
      const bill = Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
      obj.billedTotal += bill
      obj.cashBilledTotal += bill
    }
    if (allTrips[i].isCash === false) {
      obj.noOfNonCashTrips++
      const bill = Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
      obj.billedTotal += bill
      obj.nonCashBilledTotal += bill
    }
  }
  // Find driver with most trips and highest earning driver
  // Calculate no of drivers with more than one vehicles
  for (const key in allDrivers) {
    if (allDrivers[key].vehicleID.length > 1) {
      obj.noOfDriversWithMoreThanOneVehicle++
    }
    for (let i = 0; i < allTrips.length; i++) {
      if (allTrips[i].driverID === key) {
        tempAmount += Number(allTrips[i].billedAmount) || Number(allTrips[i].billedAmount.replace(',', ''))
        minTripNo++
      }
      // Driver with most trips
      if (minTripNo > maxTripNo) {
        maxTripNo = minTripNo
        obj.mostTripsByDriver.name = allDrivers[key].name
        obj.mostTripsByDriver.email = allDrivers[key].email
        obj.mostTripsByDriver.phone = allDrivers[key].phone
        obj.mostTripsByDriver.noOfTrips = maxTripNo
        obj.mostTripsByDriver.totalAmountEarned = tempAmount
      }
      // Driver with most earnings
      if (tempAmount > maxAmount) {
        maxAmount = tempAmount
        obj.highestEarningDriver.name = allDrivers[key].name
        obj.highestEarningDriver.email = allDrivers[key].email
        obj.highestEarningDriver.phone = allDrivers[key].phone
        obj.highestEarningDriver.noOfTrips = minTripNo
        obj.highestEarningDriver.totalAmountEarned = maxAmount
      }
    }
    tempAmount = 0
    minTripNo = 0
  }

  obj.nonCashBilledTotal = Number(obj.nonCashBilledTotal.toFixed(2))
  obj.billedTotal = Number(obj.billedTotal.toFixed(2))

  return obj
}

module.exports = analysis;

