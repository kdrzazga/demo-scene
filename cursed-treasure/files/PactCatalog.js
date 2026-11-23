class PactCatalog {
    constructor() {
        this.damageRanks = [0.15, 0.3, 0.5];
        this.rangeRanks = [0.1, 0.2, 0.3];
        this.branches = [
            {
                race: 'goblin',
                title: 'Goblin Warrens',
                color: '#8bd36a',
                pacts: [
                    this.percentPact('goblin.damage', 'Jagged Arrows', 'warren damage', this.damageRanks),
                    this.percentPact('goblin.range', "Crow's Nest", 'warren range', this.rangeRanks),
                    {
                        key: 'goblin.volley',
                        title: 'Double Nock',
                        ranks: [
                            { value: 1, description: 'Shoots 2 heroes at once' },
                            { value: 2, description: 'Shoots 3 heroes at once' },
                            { value: 3, description: 'Shoots 4 heroes at once' }
                        ]
                    }
                ]
            },
            {
                race: 'bone',
                title: 'Bone Spires',
                color: '#9fe6ff',
                pacts: [
                    this.percentPact('bone.damage', 'Grave Chill', 'spire damage', this.damageRanks),
                    this.percentPact('bone.range', 'Hollow Eyes', 'spire range', this.rangeRanks),
                    {
                        key: 'bone.deepChill',
                        title: 'Deep Frost',
                        ranks: [
                            { value: { slow: 0.1, duration: 0.5 }, description: 'Slows +10%, +0.5s' },
                            { value: { slow: 0.15, duration: 1 }, description: 'Slows +15%, +1s' },
                            { value: { slow: 0.2, duration: 1.5 }, description: 'Slows +20%, +1.5s' }
                        ]
                    }
                ]
            },
            {
                race: 'cinder',
                title: 'Cinder Shrines',
                color: '#ff9a4d',
                pacts: [
                    this.percentPact('cinder.damage', 'Hotter Coals', 'shrine damage', this.damageRanks),
                    this.percentPact('cinder.range', 'Smoke Signals', 'shrine range', this.rangeRanks),
                    {
                        key: 'cinder.wildfire',
                        title: 'Wildfire',
                        ranks: [
                            { value: 0.2, description: 'Burns for 20% damage/s' },
                            { value: 0.3, description: 'Burns for 30% damage/s' },
                            { value: 0.45, description: 'Burns for 45% damage/s' }
                        ]
                    }
                ]
            }
        ];
        this.pactsByKey = new Map(this.branches.flatMap(branch => branch.pacts).map(pact => [pact.key, pact]));
    }

    percentPact(key, title, subject, values) {
        return {
            key,
            title,
            ranks: values.map(value => ({ value, description: `+${Math.round(value * 100)}% ${subject}` }))
        };
    }

    find(key) {
        return this.pactsByKey.get(key) || null;
    }
}
