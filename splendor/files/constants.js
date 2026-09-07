const GEM = {
    WHITE: 'white',
    BLUE: 'blue',
    GREEN: 'green',
    RED: 'red',
    BLACK: 'black',
    GOLD: 'gold'
};

const GEMS = [GEM.WHITE, GEM.BLUE, GEM.GREEN, GEM.RED, GEM.BLACK];
const GEMS_WITH_GOLD = [GEM.WHITE, GEM.BLUE, GEM.GREEN, GEM.RED, GEM.BLACK, GEM.GOLD];

const GEM_COLOR = {
    white: 0xf1ecdd,
    blue: 0x2f6fd0,
    green: 0x2f9e51,
    red: 0xd23b32,
    black: 0x353b45,
    gold: 0xf0c02a
};

const GEM_TEXT_COLOR = {
    white: '#20242c',
    blue: '#ffffff',
    green: '#ffffff',
    red: '#ffffff',
    black: '#ffffff',
    gold: '#3a2c00'
};

const GEM_NAME = {
    white: 'Diamond',
    blue: 'Sapphire',
    green: 'Emerald',
    red: 'Ruby',
    black: 'Onyx',
    gold: 'Gold'
};

const SETUP_2P = {
    playerNames: ['Player 1', 'Player 2'],
    gemSupply: 6,
    goldSupply: 7,
    nobleCount: 3,
    rowSize: 4
};

const ACTION = {
    TAKE_THREE: 'takeThree',
    TAKE_TWO: 'takeTwo',
    RESERVE: 'reserve',
    BUY: 'buy'
};

const PHASE = {
    PASS: 'pass',
    IDLE: 'idle',
    DISCARD: 'discard',
    CHOOSE_NOBLE: 'chooseNoble',
    GAME_OVER: 'gameOver'
};

const WIN_SCORE = 15;
const MAX_TOKENS = 10;
const MAX_RESERVED = 3;
const TAKE_TWO_MIN = 4;
