class Noble {
    constructor(points, requirement) {
        this.points = points;
        this.requirement = requirement;
    }

    requires(gem) {
        return this.requirement[gem] || 0;
    }

    isSatisfiedBy(player) {
        for (const gem of GEMS) {
            if (player.bonus(gem) < this.requires(gem)) {
                return false;
            }
        }
        return true;
    }
}
