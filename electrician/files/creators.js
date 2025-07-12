class Creator {

    static HIGH_FLOOR_LEVEL = 104;
    static LOW_FLOOR_LEVEL = 438;

    static createEnemies(ratsData, batsData, spidersData, physics) {
        const createEnemy = (classType, data) => Creator.createEnemy(classType, data, physics);
        return [].concat(
            ratsData.map(data => createEnemy(Rat, data)),
            batsData.map(data => createEnemy(Bat, data)),
            spidersData.map(data => createEnemy(Spider, data))
        );
    }

    static createEnemy(EnemyClass, data, physics, positionAdjustment = 0) {
        const enemy = new EnemyClass(data.id);
        enemy.active = data.active;
        const y = EnemyClass === Bat ? 555 + 7 * data.id + positionAdjustment : data.y ;
        enemy.init(physics, y);

        Object.assign(enemy, {
            minX: data.minX || enemy.minX,
            maxX: data.maxX || enemy.maxX,
            angularSpeed: data.speed || enemy.angularSpeed,
            currentAngle: data.currentAngle || enemy.currentAngle,
            wireId: EnemyClass === Rat ? data.wireId : undefined
        });

        if (EnemyClass === Bat) {
            enemy.centerX = Constants.SCREEN_WIDTH / 2 + 50 - 39 * data.id;
        }

        if (data.velocity) enemy.sprite.velocity = data.velocity;
        if (data.speed) enemy.speed = data.speed;

        return enemy;
    }

    static createLevel(levelJson, physics){
       let building = new Building(levelJson.building.name);
       building.init(physics);

       levelJson.building.floors.forEach(floorData => {
           let floorBuilder = new FloorBuilder();

           floorBuilder = floorBuilder.withName(floorData.name);

           if (floorData.bottomConnectors) {
               floorBuilder = floorBuilder.withBottomConnectors(floorData.bottomConnectors);
           }

           if (floorData.ceilingConnectors) {
               floorBuilder = floorBuilder.withCeilingConnectors(floorData.ceilingConnectors);
           }

            const newFloor = floorBuilder.build();
            newFloor.init(physics);
           building.floors.push(newFloor);
       });

       building.floors.forEach(floor => floor.calculateFloorLevel());

       const ratsData = levelJson.building.enemies.rats;
       const batsData = levelJson.building.enemies.bats;
       const spidersData = levelJson.building.enemies.spiders;
       building.enemies = Creator.createEnemies(ratsData, batsData, spidersData, physics);

       building.wires = building.floors.map((floor, index) => {
           const aboveFloor = building.floors[index] || null;
           const belowFloor = building.floors[index - 1] || null;
           return new Wire(index, physics, belowFloor, aboveFloor, levelJson.building.connectionPointsCounts[index]);
       });

        building.includeWiresInInfoFrame();

       return building;
    }

    static createLevel1(physics){
       const buildingData = {
            "building": {
                "name": 'Dwelling 1',
                "floors": [
                  {
                    "name": "floor2",
                    "bottomConnectors": [23, 24, 25],
                    "ceilingConnectors": [7, 12, 23]
                  },
                  {
                    "name": "power-room",
                    "ceilingConnectors": [7, 12, 19, 20, 21, 26, 27, 28]
                  },
                  {
                    "name": "basement",
                    "ceilingConnectors": [7, 12, 23]
                  }
                ],
                "enemies":{
                    "rats": [
                        { id: 1, active: true, y: Building.GROUND_FLOOR_LEVEL },
                        { id: 2, active: true, y: Creator.LOW_FLOOR_LEVEL, velocity: { x: 0.7 }, wireId: 2},
                        //{ id: 4, active: true, y: MID_FLOOR_LEVEL, velocity: { x: 0.85}, wireId: 1},
                        { id: 3, active: true, y: Creator.HIGH_FLOOR_LEVEL, wireId: 0}
                    ],

                    "bats": [
                        { id: 0, active: true, speed: -0.007 }
                    ],

                    "spiders": []
                },
                "connectionPointsCounts": [3, 11, 3]
            }
       };

       let building = Creator.createLevel(buildingData, physics);
       return building;
    }

    static createLevel2(physics){

       const buildingData = {
            "building": {
                "name": 'Office Gym Garage 1',
                "floors": [
                  {
                    "name": "office",
                    "bottomConnectors": [5, 9, 13, 16, 19, 26],
                    "ceilingConnectors": [5, 12, 20, 26]
                  },
                  {
                    "name": "gym",
                    "ceilingConnectors": [7, 23]
                  },
                  {
                    "name": "garage",
                    "ceilingConnectors": [5, 20, 22, 29]
                  }
                ],
                "enemies":{
                    "rats": [
                        { id: 1, active: true, y: Building.GROUND_FLOOR_LEVEL }
                    ],

                    "bats": [
                        { id: 0, active: true, speed: 0.007 },
                        { id: 1, active: true, speed: 0.006 },
                        { id: 2, active: true, speed: 0.005 },
                        { id: 3, active: true, speed: 0.004 },
                        { id: 4, active: true, speed: 0.008 },
                        { id: 5, active: true, speed: 0.0053 },
                        { id: 6, active: true, speed: 0.009 },
                        { id: 7, active: true, speed: 0.0042 }
                    ],

                    "spiders": []
                },
                "connectionPointsCounts" : [4, 8, 4]
            }
        };

       let building = Creator.createLevel(buildingData, physics);
       return building;
    }

    static createLevel3(physics) {

       let building = new Building('House');
       building.init(physics); // Initializes ladder and power lines

       const floorBuilder1 = new FloorBuilder();
       building.floors.push(floorBuilder1.withName('attic').withBottomConnectors([3, 11, 28])
           .withCeilingConnectors([5, 25]).build());

       const floorBuilder2 = new FloorBuilder();
       building.floors.push(floorBuilder2.withName('living room').withCeilingConnectors([2, 29])
           .withLampInCenter().withTVInCenterLeft().build());

       const kitchenBuilder = new FloorBuilder();
       building.floors.push(kitchenBuilder.withName('kitchen').withFridgeOnLeft().withLampInCenter().withKitchenSegmentOnRight().build());

       building.floors.forEach(floor => floor.init(physics));
       building.floors.forEach(floor => floor.calculateFloorLevel());

       const connectionPointsCounts = [2, 6, 5];
       building.wires = building.floors.map((floor, index) => {
           const aboveFloor = building.floors[index] || null;
           const belowFloor = building.floors[index - 1] || null;
           return new Wire(index, physics, belowFloor, aboveFloor, connectionPointsCounts[index]);
       });

        building.includeWiresInInfoFrame();
        const MID_FLOOR_LEVEL = 328 - Floor.HEIGHT / 2;

        const ratsData = [
            { id: 1, active: true, y: Building.GROUND_FLOOR_LEVEL },
            { id: 2, active: true, y: Building.GROUND_FLOOR_LEVEL, minX:  Floor.WIDTH / 2, maxX: 2 * Floor.WIDTH / 3, velocity: { x : 3} },
            { id: 3, active: true, y: Building.GROUND_FLOOR_LEVEL, velocity: { x: 1.4 } },
            { id: 4, active: true, y: Creator.LOW_FLOOR_LEVEL, velocity: { x: 0.7 }, wireId: 2},
            { id: 5, active: true, y: MID_FLOOR_LEVEL, minX: 2 * Floor.WIDTH / 4, maxX: 1.15*Floor.WIDTH, velocity: { x: 1.4 }, wireId: 1 },
            { id: 6, active: true, y: MID_FLOOR_LEVEL, minX: 2 * Ladder.WIDTH, velocity: { x: 0.85}, wireId: 1 },
            { id: 7, active: true, y: Creator.HIGH_FLOOR_LEVEL, minX: Floor.WIDTH / 3 + 30, maxX: 1.15*Floor.WIDTH, wireId: 0 }
        ];

        const batsData = [
            { id: 0, active: true, speed: -0.017 },
            { id: 1, active: true, currentAngle: Math.PI / 2, /*speed: 0.001*/ }
        ];

        const spidersData = [
        ];

        building.enemies = Creator.createEnemies(ratsData, batsData, spidersData, physics);

        return building;
    }

    static createLevel4(physics){
       const buildingData = {
            "building": {
                "name": 'Dwelling 1',
                "floors": [
                  {
                    "name": "music-floor",
                    "bottomConnectors": [3, 9, 14, 17, 21, 25, 28],
                    "ceilingConnectors": [6, 19]
                  },
                  {
                    "name": "computer-room",
                    "bottomConnectors" : [26],
                    "ceilingConnectors": [2, 7, 12, 20]
                  },
                  {
                    "name": "computer-room2",
                    "ceilingConnectors": [5, 12, 15, 19, 25]
                  }
                ],
                "enemies":{
                    "rats": [
                       { id: 1, active: true, y: Building.GROUND_FLOOR_LEVEL, velocity: { x: 0.7 } },
                       { id: 2, active: true, y: Building.GROUND_FLOOR_LEVEL, velocity: { x: 0.8 } },
                       { id: 3, active: true, y: Building.GROUND_FLOOR_LEVEL, velocity: { x: 0.9 } },
                       { id: 4, active: true, y: Creator.LOW_FLOOR_LEVEL, velocity: { x: 0.7 }, wireId: 2},
                       { id: 5, active: true, y: Creator.HIGH_FLOOR_LEVEL, wireId: 0},
                       { id: 6, active: true, y: Creator.HIGH_FLOOR_LEVEL, wireId: 0, velocity: { x: 0.97 } }
                    ],

                    "bats": [
                        { id: 0, active: true, speed: -0.007 },
                        { id: 1, active: true, speed: -0.006 },
                        { id: 2, active: true, speed: 0.003 }
                    ],

                    "spiders": [{ id: 1, active: true, y: 25, velocity: { y: 0.5 } }]
                },
                "connectionPointsCounts" : [2, 11, 6]
            }
        };

       let building = Creator.createLevel(buildingData, physics);
       return building;
    }

    static createLevel5(physics){
       const buildingData = {
            "building": {
                "name": 'Spider Dwelling',
                "floors": [
                  {
                    "name": "spider-webs1",
                    "bottomConnectors": [],
                    "ceilingConnectors": []
                  },
                  {
                    "name": "spider-webs2",
                    "bottomConnectors" : [],
                    "ceilingConnectors": []
                  },
                  {
                    "name": "spider-webs3",
                    "ceilingConnectors": []
                  }
                ],
                "enemies":{
                    "rats": [
                    ],

                    "bats": [
                        { id: 0, active: true, speed: -0.009 },
                        { id: 1, active: true, speed: -0.010 }
                    ],

                    "spiders": [
                        { id: 1, active: true, y: 25, speed : 0.7},
                        { id: 1, active: true, y: 25, speed : 1.4},
                        { id: 1, active: true, y: 25, speed : 0.35},
                        { id: 2, active: true, y: 25, speed : 3},
                        { id: 3, active: true, y: 25, speed : 1.1},
                        { id: 6, active: true, y: 25, speed : 0.6},
                        { id: 8, active: true, y: 25, speed : 0.9},
                        { id: 10, active: true, y: 25, speed : 1},
                        { id: 12, active: true, y: 25, speed : 1.8},
                    ]
                },
                "connectionPointsCounts" : [0, 0, 0]
            }
        };

       let building = Creator.createLevel(buildingData, physics);
       building.floors[0].sprite.flipY = true;
       building.floors[1].sprite.flipX = true;
       return building;
    }

    static createOutro(physics){
       const buildingData = {
            "building": {
                "name": 'Outro',
                "floors": [
                  {
                    "name": "none1",
                    "bottomConnectors": [],
                    "ceilingConnectors": []
                  },
                  {
                    "name": "none2",
                    "bottomConnectors" : [],
                    "ceilingConnectors": []
                  },
                  {
                    "name": "none3",
                    "ceilingConnectors": []
                  }
                ],
                "enemies":{
                    "rats": [
                        { id: 1, active: true, y: 572, wireId: 0},
                        { id: 2, active: true, y: 572, wireId: 0},
                        { id: 3, active: true, y: 572, wireId: 0},
                        { id: 4, active: true, y: 572, wireId: 0},
                        { id: 5, active: true, y: 572, wireId: 0},
                        { id: 6, active: true, y: 572, wireId: 0},
                        ],
                    "spiders": [{ id: -4, active: true, y: 25, velocity: { y: 80 } },
                                { id: 12, active: true, y: 25, velocity: { y: 11 } }
                                ],
                    "bats": [
                        { id: 0, active: true, speed: -0.03 },
                        { id: 1, active: true, speed: 0.03 },
                        { id: 2, active: true, speed: -0.04 },
                        { id: 3, active: true, speed: 0.04 },
                    ]
                },
                "connectionPointsCounts" : [0, 0, 0]
            }
        };

       let building = Creator.createLevel(buildingData, physics);

       building.enemies.filter(e => e instanceof Bat).forEach(bat => bat.upperVerticalLimit += 3*16);
       building.enemies.filter(e => e instanceof Spider).forEach(spider =>spider.speed = 6);

       for(var i = 0; i < building.wires[1].slots.length; i++){
            building.wires[1].slots[i] = WireSlot.WIRE_STRAIGHT;
            building.wires[2].slots[i] = WireSlot.WIRE_STRAIGHT;
       }

       building.wires[1].updateWiringInfo();
       building.wires[2].updateWiringInfo();
       return building;
    }
}

class FrameCreator{

    static createLevel2ExtraInfoFrameContent(){
        const content = "<p><div>Retro computers:</div>"
                        + "<div onmouseenter='FrameCreator.showPhoto(\"files/c64.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Commodore 64</div>"
                        + "<div onmouseenter='FrameCreator.showPhoto(\"files/ibmpc286.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>IBM PC 286</div>"
                        + "<div onmouseenter='FrameCreator.showPhoto(\"files/szmatari.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Atari 800XL</div>"
                        + "<div onmouseenter='FrameCreator.showPhoto(\"files/a500.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Amiga 500</div>"
                        + "<p><div>Retro cars:</div>"
                        + "<div onmouseenter='FrameCreator.showPhoto(\"files/maluch.jpeg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Fiat 126p</div>"
                        + "<div onmouseenter='FrameCreator.showPhoto(\"files/polonez.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Polonez</div>";

        return content;
    }

    static createLevel4ExtraInfoFrameContent(){
        const content = "<p>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/fenderAmp.PNG\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Fender Amplifier</div>"
                        + "<p><div>Mainframe<br>retro computers:</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/ibm360.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>IBM S-360</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/ibm709.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>IBM 709</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/Ferranti-Mark-1.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Ferranti Mark 1</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/odra1305.png\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Elwro ODRA 1305</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/BendixG15.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Bendix G-15</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/ray704_f_s-1910516244.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Raytheon 704</div>"
                        + "<p>"
                        + "<div>Analog retro computers:</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/TelefunkenRA770.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Telefunken RA 770</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/TelefunkenRA436_2.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Telefunken RA 436/2</div>"
                        + "    <div onmouseenter='FrameCreator.showPhoto(\"files/Telefunken.jpg\");' onmouseleave='FrameCreator.hidePhotoDiv();'>Telefunken RAT 700/2</div>";

        return content;
    }

    static showPhoto(picLink){
        let photosFrame = document.getElementById('photos');
        photosFrame.style.display = 'block';
        let photoImg = document.getElementById('photo');
        photoImg.setAttribute('src', picLink);
    }

    static hidePhotoDiv(){
        console.log('hide');
        let photosFrame = document.getElementById('photos');
        photosFrame.style.display = 'none';
    }
}
