class Enemy {
  constructor(id, name, HP, range, damage) {
    this.id = id;
    this.name = name;
    this.HP = HP;
    this.range = range;
    this.damage = damage;
  }
}

const rifleman              = new Enemy( 1, "Rifleman",                     10,  1,  3);
const machineGunner         = new Enemy( 2, "Machine Gunner",               14,  3,  2);
const antiTankSoldier       = new Enemy( 3, "Anti-Tank Soldier",            12,  1,  8);
const specialForcesSquad    = new Enemy( 4, "Special Forces Squad",         25,  2,  6);

const motorcycleScout       = new Enemy( 5, "Motorcycle Scout",             15,  1,  4);
const raidJeep              = new Enemy( 6, "Raid Jeep",                    30,  2,  5);
const towHumvee             = new Enemy( 7, "Humvee with TOW",              35,  1, 12);
const armoredCar            = new Enemy( 8, "Armored Car",                  50,  2,  6);

const apc                   = new Enemy( 9, "Armored Personnel Carrier",    70,  2,  7);
const wheeledIFV            = new Enemy(10, "Wheeled IFV",                  85,  2, 10);
const trackedIFV            = new Enemy(11, "Tracked IFV",                 100,  3, 12);
const antiAirGun            = new Enemy(12, "Self-Propelled Anti-Air Gun",  90,  4,  8);

const lightTank             = new Enemy(13, "Light Tank",                  120,  1, 18);
const tankDestroyer         = new Enemy(14, "Tank Destroyer",              110,  1, 25);
const mediumTank            = new Enemy(15, "Medium Tank",                 160,  2, 20);
const selfPropelledHowitzer = new Enemy(16, "Self-Propelled Howitzer",     130,  5, 22);
const mainBattleTank        = new Enemy(17, "Main Battle Tank",            220,  2, 30);
const advancedMBT           = new Enemy(18, "Advanced MBT",                280,  2, 38);

const samLauncher           = new Enemy(19, "Mobile SAM Launcher",         150,  6, 20);
const rocketLauncher        = new Enemy(20, "Multiple Rocket Launcher",    170,  8, 25);
const precisionRocket       = new Enemy(21, "Precision Rocket System",     190,  4, 45);
const ballisticMissile      = new Enemy(22, "Ballistic Missile Launcher",  250, 10, 60);

const ENEMIES = [
  rifleman, machineGunner, antiTankSoldier, specialForcesSquad,
  motorcycleScout, raidJeep, towHumvee, armoredCar,
  apc, wheeledIFV, trackedIFV, antiAirGun,
  lightTank, tankDestroyer, mediumTank, selfPropelledHowitzer,
  mainBattleTank, advancedMBT,
  samLauncher, rocketLauncher, precisionRocket, ballisticMissile,
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Enemy, ENEMIES };
}
