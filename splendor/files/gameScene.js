class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#0b0f14');
        this.match = new Game(SETUP_2P);
        this.tokenSel = [];
        this.pickedCard = null;
        this.pickedView = null;
        this.pickedDeckLevel = null;
        this.nobleChoices = [];
        this.cardViews = [];
        this.nobleViews = [];

        this.hud = new Hud(this);
        this.deckLayer = this.add.container(0, 0);
        this.selectionLayer = this.add.container(0, 0);
        this.bankView = new BankView(this, gem => this.onTokenPick(gem));
        this.panels = this.match.players.map((player, index) =>
            new PlayerPanelView(this, LAYOUT.panel.x, LAYOUT.panel.y + index * LAYOUT.panel.step, player, {
                onToken: gem => this.onPanelToken(gem),
                onReserved: card => this.onReservedClick(card)
            })
        );
        this._buildButtons();
        this._startTurn(false);
    }

    _buildButtons() {
        const x = LAYOUT.action.x;
        const y = LAYOUT.action.buttonsY;
        this.buttons = {
            confirm: new Button(this, x + 70, y, 140, 46, 'Confirm', () => this.onConfirm()),
            buy: new Button(this, x + 70, y, 140, 46, 'Buy', () => this.onBuy()),
            reserve: new Button(this, x + 230, y, 160, 46, 'Reserve', () => this.onReserve()),
            cancel: new Button(this, x + 410, y, 120, 46, 'Cancel', () => this.onCancel())
        };
    }

    onTokenPick(gem) {
        if (this.phase !== PHASE.IDLE || gem === GEM.GOLD) {
            return;
        }
        if (this.match.board.bank.count(gem) <= 0) {
            return;
        }
        this._clearCardPick();
        const sel = this.tokenSel;
        if (sel.length === 0) {
            sel.push(gem);
        } else if (sel.length === 1) {
            if (sel[0] === gem) {
                if (this.match.board.bank.canTakeTwo(gem)) {
                    sel.push(gem);
                }
            } else {
                sel.push(gem);
            }
        } else if (sel.length === 2 && sel[0] !== sel[1] && sel.indexOf(gem) < 0) {
            sel.push(gem);
        }
        this.hud.setMessage('');
        this._refreshLight();
    }

    onCardClick(card, view) {
        if (this.phase !== PHASE.IDLE) {
            return;
        }
        this.tokenSel = [];
        this._clearCardPick();
        this.pickedCard = card;
        this.pickedView = view;
        view.setHighlight(true);
        this.hud.setMessage(this.match.canBuy(card)
            ? 'Buy or Reserve this card'
            : (this.match.canReserve() ? 'Too expensive - Reserve it?' : 'Cannot afford or reserve this'));
        this._refreshLight();
    }

    onReservedClick(card) {
        if (this.phase !== PHASE.IDLE) {
            return;
        }
        this.tokenSel = [];
        this._clearCardPick();
        this.pickedCard = card;
        this.hud.setMessage(this.match.canBuy(card) ? 'Buy this reserved card' : 'Not enough tokens to buy this');
        this._refreshLight();
    }

    onDeckClick(level) {
        if (this.phase !== PHASE.IDLE || this.match.board.decks[level].isEmpty) {
            return;
        }
        this.tokenSel = [];
        this._clearCardPick();
        this.pickedDeckLevel = level;
        this.hud.setMessage(this.match.canReserve() ? 'Reserve a blind card from level ' + level + '?' : 'Reserve limit reached');
        this._refreshLight();
    }

    onConfirm() {
        const sel = this.tokenSel;
        if (sel.length === 0) {
            return;
        }
        if (sel.length === 2 && sel[0] === sel[1]) {
            this.match.takeTwo(sel[0]);
        } else {
            this.match.takeThree(sel);
        }
        this.tokenSel = [];
        this._postAction();
    }

    onBuy() {
        const card = this.pickedCard;
        if (!card || !this.match.canBuy(card)) {
            return;
        }
        this._clearCardPickRefs();
        this.match.buy(card);
        this._postAction();
    }

    onReserve() {
        if (!this.match.canReserve()) {
            return;
        }
        if (this.pickedDeckLevel != null) {
            this.match.reserveFromDeck(this.pickedDeckLevel);
        } else {
            const card = this.pickedCard;
            if (!card || this.match.currentPlayer.holdsReserved(card)) {
                return;
            }
            this.match.reserveCard(card);
        }
        this._clearCardPickRefs();
        this._postAction();
    }

    onCancel() {
        this.tokenSel = [];
        this._clearCardPick();
        this.hud.setMessage('Take tokens, buy or reserve a card');
        this._refreshLight();
    }

    onPanelToken(gem) {
        if (this.phase !== PHASE.DISCARD) {
            return;
        }
        this.match.returnToken(gem);
        if (this.match.mustDiscard()) {
            this._refreshAll();
        } else {
            this._proceedNobles();
        }
    }

    onNobleClick(noble) {
        if (this.phase !== PHASE.CHOOSE_NOBLE || this.nobleChoices.indexOf(noble) < 0) {
            return;
        }
        this.match.claimNoble(noble);
        this._endStep();
    }

    _postAction() {
        this._refreshAll();
        if (this.match.mustDiscard()) {
            this.phase = PHASE.DISCARD;
            this.hud.setMessage(this.match.currentPlayer.name + ': click your tokens to return down to 10');
            this._refreshAll();
            return;
        }
        this._proceedNobles();
    }

    _proceedNobles() {
        const qualifying = this.match.qualifyingNobles();
        if (qualifying.length === 1) {
            this.match.claimNoble(qualifying[0]);
            this._endStep();
        } else if (qualifying.length > 1) {
            this.phase = PHASE.CHOOSE_NOBLE;
            this.nobleChoices = qualifying;
            this.hud.setMessage('Choose a noble to receive');
            this._refreshAll();
        } else {
            this._endStep();
        }
    }

    _endStep() {
        this.match.advanceTurn();
        if (this.match.over) {
            this._showGameOver();
        } else {
            this._startTurn(true);
        }
    }

    _startTurn(showPass) {
        this.phase = PHASE.IDLE;
        this.tokenSel = [];
        this._clearCardPickRefs();
        this.nobleChoices = [];
        this.hud.setTurn(this.match.currentPlayer.name);
        this.hud.setMessage('Take tokens, buy or reserve a card');
        this._refreshAll();
        if (showPass) {
            this._showPassOverlay();
        }
    }

    _clearCardPick() {
        if (this.pickedView) {
            this.pickedView.setHighlight(false);
        }
        this._clearCardPickRefs();
    }

    _clearCardPickRefs() {
        this.pickedCard = null;
        this.pickedView = null;
        this.pickedDeckLevel = null;
    }

    _refreshAll() {
        this._refreshTableau();
        this.bankView.refresh(this.match.board.bank);
        this.bankView.setEnabled(this.phase === PHASE.IDLE);
        this.panels.forEach((panel, index) => panel.refresh(index === this.match.current, this.phase));
        this._updateButtons();
        this._updateSelectionDisplay();
    }

    _refreshLight() {
        this.panels.forEach((panel, index) => panel.refresh(index === this.match.current, this.phase));
        this._updateButtons();
        this._updateSelectionDisplay();
    }

    _refreshTableau() {
        this.cardViews.forEach(view => view.destroy());
        this.nobleViews.forEach(view => view.destroy());
        this.cardViews = [];
        this.nobleViews = [];
        this.deckLayer.removeAll(true);

        const idle = this.phase === PHASE.IDLE;
        const choosing = this.phase === PHASE.CHOOSE_NOBLE;

        this.match.board.nobles.forEach((noble, index) => {
            const x = LAYOUT.cardX(0) + index * (LAYOUT.noble.size + 18);
            const view = new NobleView(this, x, LAYOUT.tableau.nobleY, noble, n => this.onNobleClick(n));
            if (choosing && this.nobleChoices.indexOf(noble) >= 0) {
                view.setHighlight(true);
            }
            this.nobleViews.push(view);
        });

        for (const level of [3, 2, 1]) {
            const y = LAYOUT.rowY(level);
            this._buildDeck(level, LAYOUT.tableau.x, y);
            this.match.board.rows[level].forEach((card, slot) => {
                if (!card) {
                    return;
                }
                const view = new CardView(this, LAYOUT.cardX(slot), y, card, (c, v) => this.onCardClick(c, v));
                view.setSelectable(idle);
                if (card === this.pickedCard) {
                    view.setHighlight(true);
                    this.pickedView = view;
                }
                this.cardViews.push(view);
            });
        }
    }

    _buildDeck(level, x, y) {
        const deck = this.match.board.decks[level];
        const w = LAYOUT.card.w;
        const h = LAYOUT.card.h;
        const shades = { 1: 0x2b5a3a, 2: 0x2b3f5a, 3: 0x4a2b5a };
        const back = this.add.rectangle(x, y, w, h, shades[level]).setOrigin(0).setStrokeStyle(3, 0x11161b);
        const title = this.add.text(x + w / 2, y + 36, 'L' + level + '\nstack', {
            fontFamily: 'monospace', fontSize: '22px', color: '#dfe8ee', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);
        const count = this.add.text(x + w / 2, y + h - 28, deck.remaining + ' cards\nleft', {
            fontFamily: 'monospace', fontSize: '13px', color: '#aeb9c2', align: 'center'
        }).setOrigin(0.5);
        if (!deck.isEmpty) {
            back.setInteractive({ useHandCursor: true });
            back.on('pointerdown', () => this.onDeckClick(level));
        }
        this.deckLayer.add([back, title, count]);
    }

    _updateButtons() {
        const buttons = this.buttons;
        const idle = this.phase === PHASE.IDLE;
        const hasTokens = this.tokenSel.length > 0;
        const card = this.pickedCard;
        const deckLevel = this.pickedDeckLevel;
        const showCard = idle && !hasTokens && (card != null || deckLevel != null);

        buttons.confirm.setVisible(idle && hasTokens).setEnabled(hasTokens);
        buttons.buy.setVisible(showCard && card != null).setEnabled(card != null && this.match.canBuy(card));
        const reserveOk = (deckLevel != null || (card != null && !this.match.currentPlayer.holdsReserved(card))) && this.match.canReserve();
        buttons.reserve.setVisible(showCard).setEnabled(reserveOk);
        buttons.cancel.setVisible((idle && hasTokens) || showCard);
    }

    _updateSelectionDisplay() {
        this.selectionLayer.removeAll(true);
        if (this.tokenSel.length === 0) {
            return;
        }
        const parts = [this.add.text(LAYOUT.action.x, LAYOUT.action.selectionY, 'taking', {
            fontFamily: 'monospace', fontSize: '15px', color: '#9fb0bc'
        }).setOrigin(0, 0.5)];
        this.tokenSel.forEach((gem, index) => {
            parts.push(Gfx.tokenCircle(this, LAYOUT.action.x + 92 + index * 46, LAYOUT.action.selectionY, 18, gem));
        });
        this.selectionLayer.add(parts);
    }

    _showPassOverlay() {
        this.phase = PHASE.PASS;
        const layer = this.add.container(0, 0);
        const shade = this.add.rectangle(0, 0, LAYOUT.width, LAYOUT.height, 0x05080b, 0.94).setOrigin(0).setInteractive();
        const name = this.add.text(LAYOUT.width / 2, LAYOUT.height / 2 - 60, this.match.currentPlayer.name, {
            fontFamily: 'monospace', fontSize: '40px', color: '#7fd7ff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const sub = this.add.text(LAYOUT.width / 2, LAYOUT.height / 2 - 4, 'Pass the device, then start your turn.', {
            fontFamily: 'monospace', fontSize: '18px', color: '#cfd8dc'
        }).setOrigin(0.5);
        const button = new Button(this, LAYOUT.width / 2, LAYOUT.height / 2 + 70, 220, 56, 'Start turn', () => {
            layer.destroy();
            this.phase = PHASE.IDLE;
            this._refreshAll();
        });
        layer.add([shade, name, sub, button.container]);
    }

    _showGameOver() {
        this.phase = PHASE.GAME_OVER;
        this._refreshAll();
        const layer = this.add.container(0, 0);
        const shade = this.add.rectangle(0, 0, LAYOUT.width, LAYOUT.height, 0x05080b, 0.93).setOrigin(0).setInteractive();
        const items = [shade];
        items.push(this.add.text(LAYOUT.width / 2, 210, 'GAME OVER', {
            fontFamily: 'monospace', fontSize: '40px', color: '#7fd7ff', fontStyle: 'bold'
        }).setOrigin(0.5));
        items.push(this.add.text(LAYOUT.width / 2, 272, this.match.winner.name + ' wins!', {
            fontFamily: 'monospace', fontSize: '26px', color: '#f4e2a6'
        }).setOrigin(0.5));
        this.match.players.forEach((player, index) => {
            items.push(this.add.text(LAYOUT.width / 2, 340 + index * 34,
                player.name + ':  ' + player.prestige + ' PP,  ' + player.cards.length + ' cards,  ' + player.nobles.length + ' nobles', {
                    fontFamily: 'monospace', fontSize: '18px', color: '#cfd8dc'
                }).setOrigin(0.5));
        });
        const button = new Button(this, LAYOUT.width / 2, 476, 200, 54, 'Play again', () => this.scene.restart());
        items.push(button.container);
        layer.add(items);
    }
}
