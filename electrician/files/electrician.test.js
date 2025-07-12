const { Floor, Ladder, Building, PowerLine, Wire, WireSlot } = require('./classdef.js');

describe('Floor Class', () => {
    let floor;
    let mockPhysics;

    beforeEach(() => {
        floor = new Floor();
        mockPhysics = {
            add: {
                sprite: jest.fn().mockReturnValue({ x: 0, y: 0 }) // Mock sprite object
            }
        };
        floor.init(mockPhysics);
    });

    test('Floor1: should initialize with the correct ID and level', () => {
        expect(floor.id).toBe(0); // Check initial ID
        expect(floor.floorLevel).toBe(0); // Initial floor level
    });

    test('Floor2: calculateFloorLevel should set floorLevel correctly', () => {
        Floor.COUNT = 3; // Simulate 3 floors created
        floor.calculateFloorLevel();
        expect(floor.floorLevel).toBe(334); // 500 / 3 * 2= ~334
        expect(floor.sprite.y).toBe(floor.floorLevel); // Check that sprite y is set correctly
    });

    test('Floor3: onFloor should return false for y outside of floor boundaries', () => {
        floor.floorLevel = 100;
        Floor.WIDTH = 200; // Setting the width for test
        const result = floor.onFloor(250, 100); // X is outside
        expect(result).toBe(false);
    });

    test('Floor4: onFloor should warn on invalid y argument', () => {
        console.warn = jest.fn(); // Mock console.warn
        floor.onFloor(50, 'invalid');
        expect(console.warn).toHaveBeenCalledWith('Wrong argument');
    });
});

describe('Ladder Class', () => {
    let ladder;
    let mockPhysics;

    beforeEach(() => {
        ladder = new Ladder();
        mockPhysics = {
            add: {
                sprite: jest.fn().mockReturnValue({ x: 0 }) // Mock sprite object
            }
        };
        ladder.init(mockPhysics);
    });

    test('Ladder1: should correctly identify if an x position is on the ladder', () => {
        ladder.sprite.x = 100; // Set the ladder position
        expect(ladder.onLadder(100)).toBe(true); // Exact match
        expect(ladder.onLadder(129)).toBe(true); // Inside
        expect(ladder.onLadder(60)).toBe(false); // Outside
    });
});

describe('Wire Class', () => {
    let wire;
    let mockPhysics;
    let mockFloor1;
    let mockFloor2;

    beforeEach(() => {
        mockPhysics = {
            add: {
                sprite: jest.fn().mockReturnValue({
                    destroy: jest.fn(),
                }),
            },
        };

        mockFloor1 = {
            id: 'F1',
            floorLevel: 1,
            sprite: { x: 10, y: 20 },
            getLeftPosition: jest.fn().mockReturnValue(10),
        };

        mockFloor2 = {
            id: 'F2',
            floorLevel: 2,
            sprite: { x: 30, y: 40 },
            getLeftPosition: jest.fn().mockReturnValue(30),
        };

        wire = new Wire('W1', mockPhysics, mockFloor1, mockFloor2, 3);
    });

    test('should create wire with correct slot configuration', () => {
        expect(wire.slots.length).toBe(Math.ceil(Floor.WIDTH / Wire.SLOT_SIZE));
        expect(wire.slots).toEqual(Array(Math.ceil(Floor.WIDTH / Wire.SLOT_SIZE)).fill(WireSlot.EMPTY));
        expect(wire.sprites).toEqual([]);
    });

    test('should calculate connected percentage correctly 1 (100%)', () => {
        for (var i = 0; i < 10; i++){
            wire.slots[i] = WireSlot.WIRE_STRAIGHT;
            if (i%4 == 0) wire.slots[i] = WireSlot.WIRE_UP;
            else if (i%3 == 0) wire.slots[i] = WireSlot.WIRE_DOWN;
        }
        expect(wire.calculateConnectedPercentage()).toBe(100);
    });

    test('should calculate connected percentage correctly 2 (40%)', () => {
        wire.slots[4] = WireSlot.WIRE_STRAIGHT;
        wire.slots[6] = WireSlot.WIRE_UP;
        wire.slots[9] = WireSlot.WIRE_DOWN;

        expect(wire.calculateConnectedPercentage()).toBe(30);
    });


    test('should correctly get slot at a coordinate x', () => {
        const result = wire.getSlotAtCoordinateX(mockFloor1, 15);
        expect(result.index).toBe(0);
        expect(result.slot).toBe(WireSlot.EMPTY);
    });

    test('should handle out of bounds index correctly', () => {
        const result = wire.getSlotAtCoordinateX(mockFloor1, 5);
        expect(result.index).toBe(-1);
        expect(result.slot).toBe(undefined);
    });
});