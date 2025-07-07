class Globals {
    static debug = false;
    static doors = {
        'Scene7' : {
            'door-green': true
        },
        'Scene10' : {
            'door-red': true,
            'door-blue': true
        },
        'Scene13' : {
            'door-blue': true
        },
        'Scene20' : {
            'door-blue': true
        },
        'Scene25' : {
            'door-blue': true
        },
        'SceneKamikaze' : {
            'door-green': true
        },
        'SceneCages' : {
            'door-red': true,
            'door-blue': true
        }
    }

    static doorKeys = {
        'Scene4' : true,
        'Scene7' : true,
        'Scene8' : true,
        'Scene9' : true,
        'Scene15' : true,
        'Scene21' : true,
        'Scene23' : true,
        'Scene24' : true,
        'Scene25' : true,
        'Scene27' : true,
        'SceneKamikaze' : true
    }

    static ENEMIES_COUNT = 0;
    static TILE_WIDTH = 60;
    static PLAYER_X = Globals.TILE_WIDTH;
    static INITIAL_PLAYER_X = Globals.PLAYER_X;
    static PLAYER_Y = Globals.TILE_WIDTH * 9;
    static INITIAL_PLAYER_Y = Globals.PLAYER_Y;
    static skullSwarm = [ {'row': 3, 'side': 'left'}, {'row': 5, 'side': 'left'}
        , {'row': 9, 'side': 'right'}, {'row': 5, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 5, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 6, 'side': 'right'}, {'row': 5, 'side': 'right'}
        , {'row': 6, 'side': 'right'}, {'row': 6, 'side': 'right'}
        , {'row': 5, 'side': 'right'}, {'row': 6, 'side': 'right'}
        , {'row': 5, 'side': 'left'}, {'row': 5, 'side': 'left'}
        , {'row': 3, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 5, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 1, 'side': 'right'}, {'row': 5, 'side': 'right'}
        , {'row': 3, 'side': 'right'}, {'row': 7, 'side': 'right'}
        , {'row': 5, 'side': 'right'}, {'row': 6, 'side': 'right'},
        {'row': 4, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 4, 'side': 'left'}, {'row': 4, 'side': 'left'}
        , {'row': 5, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 4, 'side': 'right'}, {'row': 6, 'side': 'right'}
        , {'row': 3, 'side': 'right'}, {'row': 4, 'side': 'right'}
        , {'row': 5, 'side': 'right'}, {'row': 6, 'side': 'right'}
        , {'row': 4, 'side': 'left'}, {'row': 5, 'side': 'left'}
        , {'row': 6, 'side': 'left'}, {'row': 4, 'side': 'left'}
        , {'row': 5, 'side': 'left'}, {'row': 6, 'side': 'left'}
        , {'row': 4, 'side': 'right'}, {'row': 6, 'side': 'right'}
        , {'row': 3, 'side': 'right'}, {'row': 4, 'side': 'right'}
        , {'row': 5, 'side': 'right'}, {'row': 6, 'side': 'right'}
        ];
}
