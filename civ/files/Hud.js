class Hud {

    constructor(scene) {
        this.scene = scene;
        this.panel = document.getElementById('panel');
    }

    render(city) {
        const y = city.yields();
        this.panel.innerHTML = '';
        this.panel.appendChild(this._stats(city, y));
        this.panel.appendChild(this._citizens(city));
        this.panel.appendChild(this._construction(city));
        this.panel.appendChild(this._buildMenu(city));
        this.panel.appendChild(this._actions(city));
        this.panel.appendChild(this._report(city));
    }

    _row(label, value, cls) {
        const div = document.createElement('div');
        div.className = 'stat';
        const span = cls ? '<span class="' + cls + '">' : '<span>';
        div.innerHTML = '<span>' + label + '</span>' + span + value + '</span>';
        return div;
    }

    _stats(city, y) {
        const box = document.createElement('div');
        box.className = 'block';
        const eat = city.level * city.ruleset.foodPerCitizen;
        const cap = city.contentLimit();
        const bonus = cap - city.ruleset.contentBase;
        box.appendChild(this._row('Turn', city.turn));
        box.appendChild(this._row('Level', city.level));
        box.appendChild(this._row('Food', y.food + ' - eat ' + eat + ' (store ' + city.foodStore + '/' + city.ruleset.foodNeeded(city.level) + ')'));
        box.appendChild(this._row('Shields', y.shields + ' / turn'));
        box.appendChild(this._row('Trade', y.trade));
        const income = y.gold + (city.current && city.current.isProcess() ? y.shields : 0);
        box.appendChild(this._row('Gold', city.gold + ' (+' + income + '/turn)'));
        box.appendChild(this._row('Happiness', 'orderly up to level ' + cap + ' (base ' + city.ruleset.contentBase + ' +' + bonus + ' buildings)'));
        box.appendChild(this._row('Mood', city.inDisorder() ? 'DISORDER (L' + city.level + ' > cap ' + cap + ')' : 'content (L' + city.level + ' <= cap ' + cap + ')', city.inDisorder() ? 'bad' : 'good'));
        return box;
    }

    _citizens(city) {
        const box = document.createElement('div');
        box.className = 'block';
        box.appendChild(this._title('Citizens'));
        box.appendChild(this._row('Population', city.level));
        box.appendChild(this._row('Workers', city.workers() + ' of ' + city.level + ' (make shields)'));
        const wrap = document.createElement('div');
        wrap.className = 'stat';
        const label = document.createElement('span');
        label.textContent = 'Entertainers';
        const select = document.createElement('select');
        for (let i = 0; i <= city.level; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i + ' (+' + i * city.ruleset.luxuryPerEntertainer + ' happy)';
            if (i === city.entertainers) opt.selected = true;
            select.appendChild(opt);
        }
        select.onchange = () => this.scene.setEntertainers(parseInt(select.value, 10));
        wrap.appendChild(label);
        wrap.appendChild(select);
        box.appendChild(wrap);
        return box;
    }

    _construction(city) {
        const box = document.createElement('div');
        box.className = 'block';
        const process = city.current && city.current.isProcess();
        box.appendChild(this._title(process ? 'Production' : 'Under construction'));
        if (process) {
            box.appendChild(this._row(city.current.name, 'shields -> gold each turn'));
        } else if (city.current) {
            box.appendChild(this._row(city.current.name, city.current.shields + ' / ' + city.current.cost));
            const bar = document.createElement('div');
            bar.className = 'bar';
            const fill = document.createElement('div');
            fill.className = 'fill';
            fill.style.width = Math.round(city.current.progress() * 100) + '%';
            bar.appendChild(fill);
            box.appendChild(bar);
        } else {
            box.appendChild(this._row('Everything is built', ''));
        }
        return box;
    }

    _buildMenu(city) {
        const box = document.createElement('div');
        box.className = 'block';
        box.appendChild(this._title('Choose next building'));
        city.available.forEach(b => {
            const btn = document.createElement('button');
            btn.className = 'build' + (city.current && city.current.key === b.key ? ' active' : '');
            btn.textContent = b.isProcess() ? b.describe() : b.describe() + '  [' + b.cost + ']';
            btn.onclick = () => this.scene.chooseBuilding(b.key);
            box.appendChild(btn);
        });
        return box;
    }

    _actions(city) {
        const box = document.createElement('div');
        box.className = 'block actions';
        const end = document.createElement('button');
        end.className = 'primary';
        end.textContent = 'End Turn';
        end.onclick = () => this.scene.endTurn();
        box.appendChild(end);
        const rush = document.createElement('button');
        rush.textContent = 'Rush (' + city.rushCost() + ' gold)';
        rush.disabled = !city.current || city.current.isProcess() || city.current.isDone() || city.gold < city.rushCost();
        rush.onclick = () => this.scene.rush();
        box.appendChild(rush);
        return box;
    }

    _report(city) {
        const box = document.createElement('div');
        box.className = 'block report';
        box.textContent = city.report;
        return box;
    }

    _title(text) {
        const h = document.createElement('h3');
        h.textContent = text;
        return h;
    }
}
