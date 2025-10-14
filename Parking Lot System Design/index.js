

// ---------- Utility: simple UID generator ------------
function uid(prefix = "v") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Vehicle classes -------------------------
class Vehicle {
  constructor(id, name) {
    this.id = id || uid('veh');
    this.name = name || this.id;
    this.type = 'Vehicle';
  }
}

class Car extends Vehicle {
  constructor(id, name) {
    super(id, name);
    this.type = 'Car';
  }
}

class EVCar extends Vehicle {
  constructor(id, name) {
    super(id, name);
    this.type = 'EVCar';
  }
}

class Bike extends Vehicle {
  constructor(id, name) {
    super(id, name);
    this.type = 'Bike';
  }
}

class Truck extends Vehicle {
  constructor(id, name) {
    super(id, name);
    this.type = 'Truck';
  }
}

// ---------- Slot & Floor classes --------------------
class Slot {
  constructor(floorNumber, slotNumber, options = {}) {
    this.floor = floorNumber;
    this.slotNumber = slotNumber;
    this.id = `F${floorNumber}_S${slotNumber}`;
    this.reservedFor = options.reservedFor || null; // e.g., 'EVCar' or null
    this.occupiedBy = null; // vehicle id
  }

  isAvailableFor(vehicle) {
    if (this.occupiedBy) return false;
    if (this.reservedFor && vehicle.type !== this.reservedFor) return false;
    return true;
  }
}

class Floor {
  constructor(floorNumber, totalSlots, reserveEV = true) {
    this.floorNumber = floorNumber;
    this.slots = [];

    for (let i = 1; i <= totalSlots; i++) {
      this.slots.push(new Slot(floorNumber, i));
    }

    // Reserve one slot for EV if required (first slot reserved by default)
    if (reserveEV && totalSlots >= 1) {
      this.slots[0].reservedFor = 'EVCar';
    }
  }

  findAvailableSlotFor(vehicle) {
    // return first slot that isAvailableFor
    return this.slots.find((s) => s.isAvailableFor(vehicle)) || null;
  }
}

// ---------- Ticket & Receipt ------------------------
class Ticket {
  constructor(vehicle, slot) {
    this.ticketId = uid('ticket');
    this.vehicleId = vehicle.id;
    this.vehicleType = vehicle.type;
    this.vehicleName = vehicle.name;
    this.slotId = slot.id;
    this.floor = slot.floor;
    this.slotNumber = slot.slotNumber;
    this.entryTime = new Date();
    this.exitTime = null;
    this.paid = false;
    this.amount = 0;
  }

  close(exitTime = null, ratePerHour = 0) {
    this.exitTime = exitTime ? new Date(exitTime) : new Date();
    const hours = Ticket.calculateHours(this.entryTime, this.exitTime);
    this.amount = hours * ratePerHour;
    this.paid = true;
    return this.amount;
  }

  static calculateHours(start, end) {
    const ms = end - start;
    const hoursFloat = ms / (1000 * 60 * 60);
    const hoursCeil = Math.ceil(hoursFloat <= 0 ? 0 : hoursFloat);
    return hoursCeil;
  }

  getReceipt() {
    return {
      ticketId: this.ticketId,
      vehicleId: this.vehicleId,
      vehicleName: this.vehicleName,
      vehicleType: this.vehicleType,
      slotId: this.slotId,
      floor: this.floor,
      slotNumber: this.slotNumber,
      entryTime: this.entryTime,
      exitTime: this.exitTime,
      amount: this.amount,
    };
  }
}

// ---------- Strategies (pluggable) ------------------
class NearestFirstStrategy {
  // naive: iterate floors from 1..n and pick first available slot
  constructor(parkingLot) {
    this.parkingLot = parkingLot;
    this.name = 'NearestFirst';
  }

  findSlot(vehicle) {
    for (const floor of this.parkingLot.floors) {
      const slot = floor.findAvailableSlotFor(vehicle);
      if (slot) return slot;
    }
    return null;
  }
}

// New strategy: RoundRobinStrategy (distributes vehicles across floors)
class RoundRobinStrategy {
  constructor(parkingLot) {
    this.parkingLot = parkingLot;
    this.name = 'RoundRobin';
    this.nextFloorIndex = 0;
  }

  findSlot(vehicle) {
    const n = this.parkingLot.floors.length;
    if (n === 0) return null;

    for (let i = 0; i < n; i++) {
      const idx = (this.nextFloorIndex + i) % n;
      const floor = this.parkingLot.floors[idx];
      const slot = floor.findAvailableSlotFor(vehicle);
      if (slot) {
        this.nextFloorIndex = (idx + 1) % n;
        return slot;
      }
    }
    return null;
  }
}

// More strategies could be added and registered in the factory map.

// ---------- ParkingLot (core system) ----------------
class ParkingLot {
  constructor(name) {
    this.name = name;
    this.floors = [];
    this.tickets = new Map(); // ticketId -> Ticket
    this.vehicleTicketMap = new Map(); // vehicleId -> ticketId

    // rates per hour by vehicle type
    this.rates = {
      Car: 20,
      Bike: 10,
      Truck: 30,
      EVCar: 25,
    };

    // strategy registry (pluggable)
    this.strategyMap = {
      NearestFirst: NearestFirstStrategy,
      RoundRobin: RoundRobinStrategy, // newly added strategy
    };

    // default strategy instance
    this.strategy = null;
  }

  addFloor(totalSlots, reserveEV = true) {
    const floorNumber = this.floors.length + 1;
    const floor = new Floor(floorNumber, totalSlots, reserveEV);
    this.floors.push(floor);
    return floor;
  }

  setStrategyByName(name) {
    const StrategyClass = this.strategyMap[name];
    if (!StrategyClass) throw new Error(`Unknown strategy: ${name}`);
    this.strategy = new StrategyClass(this);
  }

  registerStrategy(name, strategyClass) {
    this.strategyMap[name] = strategyClass;
  }

  registerRate(vehicleType, ratePerHour) {
    this.rates[vehicleType] = ratePerHour;
  }

  // Park vehicle, optional entryTime to simulate older entries
  parkVehicle(vehicle, entryTime = null) {
    if (!this.strategy) this.setStrategyByName('NearestFirst');

    // if vehicle already parked
    if (this.vehicleTicketMap.has(vehicle.id)) {
      throw new Error('Vehicle already parked');
    }

    // find slot via strategy
    const slot = this.strategy.findSlot(vehicle);
    if (!slot) {
      return null; // no slot
    }

    // occupy slot
    slot.occupiedBy = vehicle.id;

    // create ticket
    const ticket = new Ticket(vehicle, slot);
    if (entryTime) {
      ticket.entryTime = new Date(entryTime);
    }
    this.tickets.set(ticket.ticketId, ticket);
    this.vehicleTicketMap.set(vehicle.id, ticket.ticketId);

    return ticket;
  }

  unparkVehicleByTicket(ticketId, exitTime = null) {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error('Invalid ticket');

    // free slot
    const floor = this.floors[ticket.floor - 1];
    const slot = floor.slots.find((s) => s.slotNumber === ticket.slotNumber);
    if (!slot) throw new Error('Slot not found in floor');
    slot.occupiedBy = null;

    // compute fee
    const rate = this.rates[ticket.vehicleType] || 0;
    const amount = ticket.close(exitTime, rate);

    // cleanup vehicleTicketMap
    this.vehicleTicketMap.delete(ticket.vehicleId);

    return ticket.getReceipt();
  }

  unparkVehicle(vehicleId, exitTime = null) {
    const ticketId = this.vehicleTicketMap.get(vehicleId);
    if (!ticketId) throw new Error('Vehicle not parked');
    return this.unparkVehicleByTicket(ticketId, exitTime);
  }

  getStatus() {
    // quick status summary
    return this.floors.map((f) => ({
      floor: f.floorNumber,
      slots: f.slots.map((s) => ({ id: s.id, reservedFor: s.reservedFor, occupiedBy: s.occupiedBy })),
    }));
  }
}

// ---------- Demo / Example usage -------------------
// The following demonstrates creating a ParkingLot, adding floors, switching strategies,
// parking EV Cars and Cars, ensuring reserved EV slots behave correctly, and computing fees.

if (require && require.main === module) {
  console.log('--- Parking Lot System Demo ---');
  const lot = new ParkingLot('City Lot');

  // Add two floors each with 5 slots, reserving 1 EV slot per floor
  lot.addFloor(5, true);
  lot.addFloor(5, true);

  // set strategy to RoundRobin (new strategy added)
  lot.setStrategyByName('RoundRobin');

  // Create vehicles
  const ev1 = new EVCar('EV_1001', 'Tesla Model 3');
  const car1 = new Car('CAR_2001', 'Toyota Corolla');
  const ev2 = new EVCar('EV_1002', 'Nissan Leaf');
  const bike1 = new Bike('BIKE_3001', 'Kawasaki');

  // park EV1 (should occupy reserved EV on floor1)
  const t1 = lot.parkVehicle(ev1, new Date(Date.now() - 1000 * 60 * 60 * 3)); // parked 3 hours ago
  console.log('Parked EV1 ticket:', t1.ticketId, 'slot:', t1.slotId);

  // park Car1 (should go to a non-reserved slot)
  const t2 = lot.parkVehicle(car1, new Date(Date.now() - 1000 * 60 * 30)); // parked 0.5 hour ago
  console.log('Parked Car1 ticket:', t2.ticketId, 'slot:', t2.slotId);

  // park EV2 (should occupy reserved EV on floor2)
  const t3 = lot.parkVehicle(ev2, new Date(Date.now() - 1000 * 60 * 60 * 1.5)); // 1.5 hours
  console.log('Parked EV2 ticket:', t3.ticketId, 'slot:', t3.slotId);

  // park bike1
  const t4 = lot.parkVehicle(bike1, new Date(Date.now() - 1000 * 60 * 60 * 2.2));
  console.log('Parked Bike ticket:', t4.ticketId, 'slot:', t4.slotId);

  // Try to park a Car when reserved EV slots are present and ensure they are not used by Car
  const car2 = new Car('CAR_2002', 'Honda Civic');
  const t5 = lot.parkVehicle(car2);
  console.log('Parked Car2 ticket:', t5 ? t5.ticketId : 'No slot', 'slot:', t5 ? t5.slotId : null);

  // Unpark EV1 after now; compute fee (3 hours * rate 25)
  const receipt1 = lot.unparkVehicle(ev1.id);
  console.log('Receipt EV1:', receipt1);

  // Unpark Car1 (0.5 hour rounded up to 1 hr -> 1 * 20)
  const receipt2 = lot.unparkVehicle(car1.id);
  console.log('Receipt Car1:', receipt2);

  // Show status
  console.log('Lot status:', JSON.stringify(lot.getStatus(), null, 2));
}

module.exports = {
  ParkingLot,
  Vehicle,
  Car,
  EVCar,
  Bike,
  Truck,
  NearestFirstStrategy,
  RoundRobinStrategy,
};
