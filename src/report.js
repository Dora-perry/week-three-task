const { getTrips, getDriver, getVehicle } = require("api");
/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  const allTrips = await getTrips();
  const randomDriver = {};
  // Fetch all the drivers and their details
  await Promise.allSettled(
    allTrips.map((e) =>
      getDriver(e.driverID)
        .then((result) => (randomDriver[e.driverID] = result))
        .then(() => (randomDriver[e.driverID]["vehicle"] = []))
    )
  );
  // Getting the driver's vehicle details
  for (const key in randomDriver) {
    if (randomDriver[key].vehicleID.length > 1) {
      for (let n = 0; n < randomDriver[key].vehicleID.length; n++) {
        const vehicle = await getVehicle(randomDriver[key].vehicleID[n]);
        randomDriver[key]["vehicle"].push(vehicle);
      }
    } else {
      const vehicle = await getVehicle(randomDriver[key].vehicleID);
      randomDriver[key]["vehicle"].push(vehicle);
    }
  }
  // Sorted the drivers in order of trips embarked on
  allDrivers = {};
  let keys = [];
  allTrips.forEach((trip) => {
    keys.push(trip.driverID);
  });
  keys = [...new Set(keys)];
  // Matching ordered keys with randomly received details
  for (const id of keys) {
    if (id in randomDriver) allDrivers[id] = randomDriver[id];
  }
  // Output structure
  const output = [];
  let personObj = {
    fullname: "",
    phone: "",
    id: "",
    vehicles: [],
    noOfTrips: 0,
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    trips: [],
    totalAmountEarned: 0,
    totalCashAmount: 0,
    totalNonCashAmount: 0,
  };
  let personVehicle = {
    plate: "",
    manufacturer: "",
  };
  let personTrip = {
    user: "",
    created: "",
    pickup: "",
    destination: "",
    billed: 0,
    isCash: false,
  };
  // Deep copy of each object structure for reuse
  const copyOfPersonObj = JSON.parse(JSON.stringify(personObj));
  const copyOfPersonVehicle = JSON.parse(JSON.stringify(personVehicle));
  const copyOfPersonTrip = JSON.parse(JSON.stringify(personTrip));
  // Looping through each driver in the outer loop while collecting trip and personal details
  for (const id in allDrivers) {
    for (let trip of allTrips) {
      if (id === trip.driverID) {
        personObj.totalAmountEarned +=
          Number(trip.billedAmount) ||
          Number(trip.billedAmount.replace(",", ""));
        personObj.noOfTrips++;
        personObj.id = id;
        personObj.fullname = allDrivers[id].name;
        personObj.phone = allDrivers[id].phone;
        if (trip.isCash === true) {
          personObj.totalCashAmount +=
            Number(trip.billedAmount) ||
            Number(trip.billedAmount.replace(",", ""));
          personObj.noOfCashTrips++;
        } else {
          personObj.totalNonCashAmount +=
            Number(trip.billedAmount) ||
            Number(trip.billedAmount.replace(",", ""));
          personObj.noOfNonCashTrips++;
        }
        personTrip.user = trip.user.name;
        personTrip.created = trip.created;
        personTrip.pickup = trip.pickup.address;
        personTrip.destination = trip.destination.address;
        personTrip.isCash = trip.isCash;
        personTrip.billed =
          Number(trip.billedAmount) ||
          Number(trip.billedAmount.replace(",", ""));
        personObj.trips.push(personTrip);
        personTrip = JSON.parse(JSON.stringify(copyOfPersonTrip));
      }
    }
    personObj.totalAmountEarned = Number(
      personObj.totalAmountEarned.toFixed(2)
    );
    personObj.totalCashAmount = Number(personObj.totalCashAmount.toFixed(2));
    personObj.totalNonCashAmount = Number(
      personObj.totalNonCashAmount.toFixed(2)
    );
    output.push(personObj);
    personObj = JSON.parse(JSON.stringify(copyOfPersonObj));
  }
  // Matching the vehicle details for each driver
  for (let driver of output) {
    const id = driver.id;
    for (const key in allDrivers[id].vehicle) {
      personVehicle.plate = allDrivers[id].vehicle[key].plate;
      personVehicle.manufacturer = allDrivers[id].vehicle[key].manufacturer;
      driver.vehicles.push(personVehicle);
      personVehicle = JSON.parse(JSON.stringify(copyOfPersonVehicle));
    }
  }
  return output;
}
module.exports = driverReport;
driverReport();

