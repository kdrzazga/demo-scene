class Creator {

    static createKarateka(scene){
        scene.anims.create({
            key: 'karateka-walk',
            frames: [
                { key: 'karateka1' },
                { key: 'karateka2' },
                { key: 'karateka3' },
                { key: 'karateka4' }
            ],
            frameRate: 3,
            repeat: -1
        });
    }

    static createGianaCalm(scene){
        scene.anims.create({
            key: 'karateka-walk',
            frames: [
                { key: 'giana-calm1' },
                { key: 'giana-calm2' },
                { key: 'giana-calm3' }
            ],
            frameRate: 3,
            repeat: -1
        });
    }

    static createGianaCrazy(scene){
        scene.anims.create({
            key: 'karateka-walk',
            frames: [
                { key: 'giana-crazy1' },
                { key: 'giana-crazy2' },
                { key: 'giana-crazy3' }
            ],
            frameRate: 3,
            repeat: -1
        });
    }
}
