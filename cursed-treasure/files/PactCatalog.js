class PactCatalog {
    constructor() {
        this.branches = [
            {
                race: 'goblin',
                title: 'Goblin Warrens',
                color: '#8bd36a',
                pacts: [
                    { key: 'goblin.damage', title: 'Jagged Arrows', description: '+25% warren damage' },
                    { key: 'goblin.range', title: "Crow's Nest", description: '+15% warren range' },
                    { key: 'goblin.volley', title: 'Double Nock', description: 'Warrens shoot a second target' }
                ]
            },
            {
                race: 'bone',
                title: 'Bone Spires',
                color: '#9fe6ff',
                pacts: [
                    { key: 'bone.damage', title: 'Grave Chill', description: '+25% spire damage' },
                    { key: 'bone.range', title: 'Hollow Eyes', description: '+15% spire range' },
                    { key: 'bone.deepChill', title: 'Deep Frost', description: 'Slows bite harder and last longer' }
                ]
            },
            {
                race: 'cinder',
                title: 'Cinder Shrines',
                color: '#ff9a4d',
                pacts: [
                    { key: 'cinder.damage', title: 'Hotter Coals', description: '+25% shrine damage' },
                    { key: 'cinder.range', title: 'Smoke Signals', description: '+15% shrine range' },
                    { key: 'cinder.wildfire', title: 'Wildfire', description: 'Blasts leave heroes burning' }
                ]
            }
        ];
    }
}
