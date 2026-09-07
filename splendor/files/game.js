class Game {
    constructor(setup) {
        this.setup = setup;
        this.board = new Board(setup);
        this.players = setup.playerNames.map(name => new Player(name));
        this.current = 0;
        this.finalRound = false;
        this.over = false;
        this.winner = null;
    }

    get currentPlayer() {
        return this.players[this.current];
    }

    canTakeThree(gems) {
        if (gems.length < 1 || gems.length > 3) {
            return false;
        }
        const seen = new Set(gems);
        if (seen.size !== gems.length) {
            return false;
        }
        for (const gem of gems) {
            if (gem === GEM.GOLD || this.board.bank.count(gem) <= 0) {
                return false;
            }
        }
        return true;
    }

    canTakeTwo(gem) {
        return this.board.bank.canTakeTwo(gem);
    }

    canBuy(card) {
        return this.currentPlayer.canAfford(card);
    }

    canReserve() {
        return this.currentPlayer.canReserveMore();
    }

    takeThree(gems) {
        for (const gem of gems) {
            this.board.bank.take(gem, 1);
            this.currentPlayer.addToken(gem, 1);
        }
    }

    takeTwo(gem) {
        this.board.bank.take(gem, 2);
        this.currentPlayer.addToken(gem, 2);
    }

    reserveCard(card) {
        const spot = this.board.locate(card);
        this.currentPlayer.reserved.push(card);
        this.board.replaceAt(spot.level, spot.slot);
        this._grantGold();
    }

    reserveFromDeck(level) {
        const drawn = this.board.decks[level].draw();
        if (drawn) {
            this.currentPlayer.reserved.push(drawn);
        }
        this._grantGold();
    }

    _grantGold() {
        if (this.board.bank.hasGold()) {
            this.board.bank.take(GEM.GOLD, 1);
            this.currentPlayer.addToken(GEM.GOLD, 1);
        }
    }

    buy(card) {
        const player = this.currentPlayer;
        const plan = player.paymentFor(card);
        for (const gem of GEMS_WITH_GOLD) {
            const paid = plan[gem];
            if (paid > 0) {
                player.removeToken(gem, paid);
                this.board.bank.give(gem, paid);
            }
        }
        if (player.holdsReserved(card)) {
            player.reserved.splice(player.reserved.indexOf(card), 1);
        } else {
            const spot = this.board.locate(card);
            this.board.replaceAt(spot.level, spot.slot);
        }
        player.cards.push(card);
    }

    mustDiscard() {
        return this.currentPlayer.tokenCount > MAX_TOKENS;
    }

    returnToken(gem) {
        if (this.currentPlayer.tokens[gem] > 0) {
            this.currentPlayer.removeToken(gem, 1);
            this.board.bank.give(gem, 1);
        }
    }

    qualifyingNobles() {
        return this.board.nobles.filter(noble => noble.isSatisfiedBy(this.currentPlayer));
    }

    claimNoble(noble) {
        this.currentPlayer.nobles.push(noble);
        this.board.removeNoble(noble);
    }

    advanceTurn() {
        if (!this.finalRound && this.currentPlayer.prestige >= WIN_SCORE) {
            this.finalRound = true;
        }
        this.current = (this.current + 1) % this.players.length;
        if (this.finalRound && this.current === 0) {
            this._finish();
        }
    }

    _finish() {
        const ranked = this.players.slice().sort((a, b) => {
            if (b.prestige !== a.prestige) {
                return b.prestige - a.prestige;
            }
            return a.cards.length - b.cards.length;
        });
        this.over = true;
        this.winner = ranked[0];
    }
}
