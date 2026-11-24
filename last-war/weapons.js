class Weapon {
    constructor(id, name, caliber, description, HP, shots, penetration) {
        this.id = id;
        this.name = name;
        this.caliber = caliber;
        this.description = description;
        this.HP = HP;
        this.shots = shots;
        this.penetration = penetration;
    }
}

const WEAPONS = [
    new Weapon(1, 'Ruger 10/22', '.22 LR rifle', 'Very small, low-energy round', 4, 3, 1),
    new Weapon(2, 'Walther PPK', '.32 / .380 ACP pistol', 'Compact pistol with a low-power cartridge', 6, 3, 1),
    new Weapon(3, 'Smith & Wesson Model 36', '.38 Special revolver', '5 shots, short barrel', 9, 2, 1),
    new Weapon(4, 'Beretta 92FS', '9mm pistol', 'Standard military/police sidearm, 15-round magazine', 10, 3, 1),
    new Weapon(5, 'Glock 17', '9mm pistol', 'Similar to the Beretta, very widespread', 10, 3.5, 1),
    new Weapon(6, 'Colt M1911', '.45 ACP pistol', 'Heavier round, smaller magazine', 14, 2.5, 1),
    new Weapon(7, 'Colt Python', '.357 Magnum revolver', 'Much more energy than 9mm, but only 6 shots', 20, 1.5, 2),
    new Weapon(8, 'Desert Eagle', '.50 AE pistol', 'Very powerful handgun round', 28, 1.5, 2),
    new Weapon(9, 'Remington 870', '12-gauge shotgun', 'Devastating up close, short range', 45, 1, 1),
    new Weapon(10, 'Uzi', '9mm submachine gun', 'Fully automatic, but pistol-caliber', 9, 10, 1),
    new Weapon(11, 'HK MP5', '9mm submachine gun', 'Automatic, accurate SMG', 10, 12, 1),
    new Weapon(12, 'AK-47', '7.62×39mm assault rifle', 'Rifle round, automatic fire, rugged', 22, 10, 2),
    new Weapon(13, 'M16', '5.56×45mm assault rifle', 'High velocity, accurate, automatic', 18, 12, 2),
    new Weapon(14, 'HK G3', '7.62×51mm battle rifle', 'Full-power rifle cartridge', 30, 8, 3),
    new Weapon(15, 'FN FAL', '7.62×51mm battle rifle', 'Same class as the G3', 30, 9, 3),
    new Weapon(16, 'Remington 700 / M24', '7.62mm sniper rifle', 'Precise kills at long range', 80, 1, 4),
    new Weapon(17, 'M249 SAW', '5.56mm light machine gun', 'Sustained belt-fed fire', 18, 14, 2),
    new Weapon(18, 'M240 / FN MAG', '7.62mm general-purpose machine gun', 'Belt-fed full-power rounds', 30, 11, 3),
    new Weapon(19, 'Barrett M82', '.50 BMG anti-materiel rifle', 'Huge energy, hits from over 1.5 km', 150, 1, 6),
    new Weapon(20, 'M2 Browning', '.50 BMG heavy machine gun', 'Automatic fire with .50 caliber rounds, mounted on vehicles', 120, 8, 5),
];
