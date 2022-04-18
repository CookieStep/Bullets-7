"use strict";
const gameVersion = "0.0.25";
const RUN_KEY = Symbol();
var Enviroment = window.Enviroment;

// https://jummbus.bitbucket.io/#j5N07Unnamedn310s1k0l00e0vt3sa7g0vj0dr1O_U00000000i0o434T0v0ru00f0000q0B1610Oa0d080w2h8E1b8T5v0pu21f0000q0B1610Oa0d080H_SJ5SJFAAAkAAAh8E1b8T0v0pu00f0000qwB17110Oa0d080wbh0E1b6T4v0kuf0f1a0q050Oa0z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00E0b8jgxd24QlBsxedQQ8jUxd0004zgidx8Q4zoid18Q4zg01llld3kQdlll4x8i5zgR4h4h4h4h4h4h4h4h4h4h4gp28FFAu46nicKh8Wh7icLh6nhcKBiEAt8OZ8pt4OWle18WpBWwlcni8W0Ki5O97g5Ox7g8Wh7AODA54zwq9BQOewhQiezhQRczwq9BQOewhQ2eEhWwmGbgFyQhq5czE4t8zjbZfA0KP8W0Ki5O97g5Op7g8Wh6CTWq_xys82Q1sxN2zhwql5nbZzOf9hFB-wj8Z6wnQamiOl0R-i9yWoJ0n8r2zhFQGePaqpjduykQjyq9jhaul6nmcKKpt4OZ8pt4OWh7i8Wh6CTWaZBDB-w84bXjfbYA7aoLRgBwxvFjA8bZ4nt1vGNFgnw5cn3GkybgAGwJ0FEQF0mHlE2Qa50mxiG2QaJ0n91qMJkmCbgaqwJkmIkR1q0J0mCbg5G2QOfl4tczGAt4zE4t0zE6nF2eyhRieyhQOeyhQ3bQNBQjbF6nhcKCbH1qoJ8mGbgaqMJkmwbg5FyQ1q0Jomwkw5cz417g8W97h8W17k8W96Cny5ckg2Q1q0J0npp4mwbg5Omh5E2Q1o0mAbJuPka53aV6xAqt0LV9gEkcBAq6hFliY00
var bullets = [];
var enemies = [];
var lockToEdges = false;
var cameraState = "";
var zoomLevel = 2;
var panSpeed = 0.2;
var zoomSpeed = 0.1;
var level = 1;
var player;
var mains = [];
var creator = window.creator;
var edit;
var DEAD = 10;
var multi;
var maxPlayers = 1;
var expert;
var Host;


//shapes.js
{
    var shapes = {};
    /**@param {(ctx: Path2D) => void} path @returns {Path2D}*/
    var shape = (name, path) =>
    {
        if(path)
        {
            var shape = new Path2D;
            path(shape);
            shapes[name] = shape;
        }
        else
        {
            return shapes[name];
        }
    };
    shape("square", ctx => ctx.rect(0, 0, 1, 1));
    shape("square-horns", ctx => {
        var a = 0.3;
        // ctx.rect(0, 0, 1-a, 1);
        ctx.lineTo(1-a, 0);
        ctx.lineTo(1, 0);
        ctx.lineTo(1-a, a);
        ctx.lineTo(1-a, 1-a);
        ctx.lineTo(1, 1);
        ctx.lineTo(1-a, 1);
        ctx.lineTo(0, 1);
        ctx.lineTo(0, 0);
        ctx.closePath();
    });
    shape("pointer", path => {
        var mid = 1/2;
        var top = 2/10;
        var btm = 8/10;
        // var spl = 1/2;
        var wid = 14/16;
        // var spr = 11/16;
        path.moveTo(mid, top);
        path.lineTo(wid, btm);
        // spr = 1 - spr;
        wid = 1 - wid;
        path.lineTo(wid, btm);
        path.closePath();
        path.rotation = PI / 2;
    });
    shape("square.3", ctx => {
        var r = .3;
        ctx.moveTo(r, 0);
        ctx.lineTo(1 - r, 0);
        ctx.quadraticCurveTo(1, 0, 1, 0 + r);
        ctx.lineTo(1, 1 - r);
        ctx.quadraticCurveTo(1, 1, 1 - r, 1);
        ctx.lineTo(r, 1);
        ctx.quadraticCurveTo(0, 1, 0, 1 - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
    });
    shape("square.4", ctx => {
        var r = .4;
        ctx.moveTo(r, 0);
        ctx.lineTo(1 - r, 0);
        ctx.quadraticCurveTo(1, 0, 1, 0 + r);
        ctx.lineTo(1, 1 - r);
        ctx.quadraticCurveTo(1, 1, 1 - r, 1);
        ctx.lineTo(r, 1);
        ctx.quadraticCurveTo(0, 1, 0, 1 - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
    });
    shape("arrow.2", path => {
        //Top Triangle
        path.moveTo(1 / 2, 1 / 8);
        path.lineTo(3 / 4, 2 / 5);
        path.lineTo(1 / 4, 2 / 5);
        path.closePath();
        //Bottom Triangle
        path.moveTo(1 / 2, 4 / 8);
        path.lineTo(3 / 4, 4 / 5);
        path.lineTo(1 / 4, 4 / 5);
        path.closePath();
        path.rotation = PI / 2;
    });
    shape("arrow", ctx => {
        ctx.rect(0, .25, .5, .5);
        ctx.moveTo(.5, 0);
        ctx.lineTo(.5, 1);
        ctx.lineTo(1, .5);
        ctx.closePath();
    });
    shape("X", ctx => {
        var s = 0.1;
        var S = 1-s;
        var m = S/2;
        var M = 1-m;
        var h = 0.5;
        ctx.moveTo(0, s);
        ctx.lineTo(s, 0);
        ctx.lineTo(h, m);
        ctx.lineTo(S, 0);
        ctx.lineTo(1, s);
        ctx.lineTo(M, h);
        ctx.lineTo(1, S);
        ctx.lineTo(S, 1);
        ctx.lineTo(h, M);
        ctx.lineTo(s, 1);
        ctx.lineTo(0, S);
        ctx.lineTo(m, h);
        ctx.closePath();
    });
    shape("link-hat", path => {
        //Top Triangle
        path.moveTo(.5, 1-2**.5/2);
        path.lineTo(0, 1);
        path.lineTo(1, 1);
        path.closePath();
    });
}
function zoom(x, y, l=1, w=1, r, {h, k}={})
{
    if(r != undefined)
    {
        if(!h)
        {
            h = x + l/2;
            k = y + w/2;
        }
        var c = cos(r);
        var s = sin(r);
        this.setTransform(c * l, s * l, -s * w, c * w, h, k);
        this.translate(-(h-x)/l, -(k-y)/w);
    }
    else
    {
        this.setTransform(l, 0, 0, w, x, y);
    }
};
CanvasRenderingContext2D.prototype.zoom = zoom;
var sprites = (() => {
    var sheet = document.createElement("canvas");
    var pen = sheet.getContext('2d');
    var m = 4096;
    sheet.width  = m;
    sheet.height = m;

    var s = 32;
    var w = m/s;
    var u = s/w;

    var coords = i => {
        var x = i % w;
        return [x*s, (i - x)*u];
    };
    pen.fillStyle   = 'white';
    pen.strokeStyle = 'white';
    pen.lineWidth = 4/s;

    var p = +2;
    var o = -4;

    var map = new Map;
    var slots = new Array(w*w);
    var len = slots.length;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    canvas.width  = s;
    canvas.height = s;

    var un = 32;

    return {
        sheet, pen, s,
        canvas, ctx,
        spriteMap: map,
        grab(shp, st, fl, hp, Of, OFF=[0, 0]) {
            if(OFF.length == 0) OFF = [0, 0];
            if(isNaN(hp)) hp = 1;
            hp = round(hp*un);

            Of = round(Of*un/PI2);
            Of = (Of % un + un) % un;

            for(var i = 0; i < len; i++) {
                if(slots[i]) {
                    let s = slots[i];
                    let c = s.hp == hp && hp == 0;
                    c ||= s.shp == shp &&
                    s.st == st &&
                    s.fl == fl &&
                    s.hp == hp &&
                    s.Of == Of &&
                    s.OFF[0] == OFF[0] &&
                    s.OFF[1] == OFF[1];
                    if(c) {
                        return slots[i].loc;
                    }
                }else break;
            }
            // console.log(shp, st, fl, hp);
            if(i == len) {
                i = 0;
            }
            var a = i+1;
            if(a == len) {
                a = 0;
            }
            if(slots[a]) {
                let [x, y] = coords(a);
                ctx.clearRect(x, y, s, s);
                delete slots[a];
            }
            var [x, y] = coords(i);
            var slot = {
                color, shp, st, fl, hp, Of, OFF,
                loc: [x+1, y+1, s-2, s-2]
            };
            Of *= PI2/un;

            x += 1;
            y += 1;
            var S = s-2;
            slots[i] = slot;
            pen.zoom(x, y, S, S);

            pen.save();
            pen.beginPath();
            pen.moveTo(.5+OFF[0], .5+OFF[1]);
            pen.arc(.5+OFF[0], .5+OFF[1], 3, -Of, -Of + PI2 * hp/un);
            pen.closePath();
            pen.clip();
            
            if(fl) {
                pen.fillStyle = fl;
                pen.fill(shape(shp));
            }
            if(st) {
                pen.zoom(x+p, y+p, S+o, S+o);
                pen.strokeStyle = st;
                pen.stroke(shape(shp));
            }
            pen.restore();
            return slot.loc;
        }
    };
})();
function color(shape, color) {
    var {sheet, canvas, ctx, spriteMap, s} = sprites;
    var [x, y, w, h] = spriteMap.get(shape);
    ctx.globalCompositeOperation = "copy";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, s, s);

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(sheet, x, y, w, h, 0, 0, s, s);
    return canvas;
}

{
    var loader = {
        load() {
            mapTiles = this.tiles;
            game.updateBackground();
            game.expert = this.expert;
            if(worldSelect.active) enemies = [];
            for(let enemy of enemies) {
                if(enemy.inWall() && !enemy.wallInv) {
                    enemy.wallInv = 1;
                }
            }
            this.delay = 0;
            var arr = [];
            if(worldSelect.active) {
                enemies = this.enemies;
            }else for(let blob of this.enemies) {
                var hit = false;
                for(let them of enemies) {
                    if((Entity.hitTest(blob, them) || Entity.collTest(blob, them)) && Entity.isTouching(blob, them)) {
                        hit = true;
                        break;
                    }
                }
                if(hit) arr.push(blob);
                else{
                    enemies.push(blob);
                    blob.spawned = true;
                    blob.onSpawned();
                }
            }
            if(arr.length) {
                this.enemies = arr;
                this.delay = 1;
            }else{
                game.color = this.color;
                game.color2 = this.color2;
                game.updateBackground();
                this.tiles = [];
                this.enemies = [];
                this.dir = 0;
            }
        },
        enemies: [],
        tiles: [],
        delay: 0
    }
}
//menu.js
{
    function Menu(label, ...items) {
        this.label = label;
        this.items = items;
        this.item = 0;
        this.load = () => {
            for(let item of this.items) {
                item.load();
            }
        };
    }
    const Input = {
        Left: Symbol(),
        Right: Symbol(),
        Up: Symbol(),
        Down: Symbol()
    };
    function Button(label, script) {
        this.use = script;
        this.label = label;
        this.load = () => 0;
    }
    /**@param {(value: boolean) => string} script*/
    function Toggle(script, loader) {
        this.value = false;
        this.use = () => {
            this.set(!this.value, this);
        };
        this.set = bool => {
            this.value = bool;
            this.label = script(bool);
        };
        this.load = () => {
            this.value = loader?.();
            this.set(this.value);
        };
    }
    /**@param {(value: number) => string} script*/
    function States(max, script, loader) {
        this.value = 0;
        this.use = (input=1) => {
            if(input == Input.Left) this.set(loop(this.value - 1, max), this);
            else if(input == Input.Right) this.set(loop(this.value + 1, max), this);
            else if(input == Input.Down) this.set(0, this);
            else if(input == Input.Up) this.set(max - 1, this);
            else this.set(loop(this.value + input, max), this);
        };
        this.set = state => {
            this.value = state;
            this.label = script(state);
        };
        this.load = () => {
            this.value = loader?.();
            if(isNaN(this.value)) {
                this.value = 0;
            }
            this.set(this.value);
        };
    }
    /**@param {(value: number, obj: Slider) => string} script*/
    function Slider({min=0, max=1, inc=1}, script, loader) {
        this.value = min;
        this.use = (input=1) => {
            if(input == Input.Up) this.set(max, this);
            else if(input == Input.Down) this.set(min, this);
            else{
                var val = this.value;
                if(typeof input != "number" || isNaN(input)) {
                    if(input == Input.Left) val -= inc;
                    else val += inc;
                }else val += input * inc;
                if(val > max) val = max;
                if(val < min) val = min;
                this.set(val, this);
            }
        };
        var area = (max - min);
        this.set = value => {
            this.value = value;
            this.slider = (value - min)/area;
            this.label = script(value, this);
        };
        this.load = () => {
            this.value = loader?.();
            if(isNaN(this.value)) {
                this.value = min;
            }
            this.set(this.value);
        };
    }
    States.colors = ["#555", "#5f5", "#ff5", "#a5f"];
    States.color = value => States.colors[value % States.colors.length];
    let load = id => localStorage.getItem(id);
    let save = (id, val) => localStorage.setItem(id, val);
    let camOpt = new States(5, value => {
        cameraState = ["screen", "player", "mouse", "auto", "lock"][value];
        save("cam.state", value);
        return ["Camera: Full Screen", "Camera: Following Player", "Camera: Following Mouse", "Camera: Auto", "Camera: Locked"][value];
    }, () => +load("cam.state") ?? 1);
    let zoomOpt = new Slider({min: 0.5, max: 2, inc: 0.1}, (value, obj) => {
        zoomLevel = value;
        save("cam.zoom", value.toFixed(1));
        if(value <= 1) {
            obj.slider = value - .5;
        }else{
            obj.slider = value/2;
        }
        return `Zoom: ${value.toFixed(1)}`;
    }, () => +load("cam.zoom") || 1);
    let expertOpt = new Toggle(value => {
        if(value) {
            save("expert", 1);
            expert = 1;
            return "Expert mode";
        }else{
            save("expert", 0);
            expert = 0;
            return "Normal mode"
        }
    }, () => +load("expert"));
    var Settings = new Menu("Settings",
        new Toggle(value => {
            if(value) {
                save("cam.lock", 1);
                lockToEdges = true;
                return "Lock to map edges";
            }else{
                save("cam.lock", 0);
                lockToEdges = false;
                return "Don't lock to edges"
            }
        }, () => +load("cam.lock") ?? 1),
        camOpt,
        zoomOpt,
        new Slider({min: 0.1, max: 1, inc: 0.1}, (value, obj) => {
            panSpeed = value;
            save("cam.pan", value.toFixed(1));
            return `Pan Speed: ${value.toFixed(1)}`;
        }, () => +load("cam.pan") || 0.2),
        new Slider({min: 0.1, max: 1, inc: 0.1}, (value, obj) => {
            zoomSpeed = value;
            save("cam.focus", value.toFixed(1));
            return `Zoom Speed: ${value.toFixed(1)}`;
        }, () => +load("cam.focus") || 0.1),
        new Slider({min: 1, max: 8}, value => {
            maxPlayers = value;
            multi = getExtras();
            if(multi >= maxPlayers) {
                multi = maxPlayers-1;
            }
            save("max.players", value);
            return `Max players: ${value}`
        }, () => +load("max.players") || 8),
        expertOpt,
        new Button("Connect to server", () => {
            wsSetup(prompt("Link to server: "));
        })
    );
    var setCam = i => camOpt.set(i);
    var modZoom = i => zoomOpt.use(i);
    var toggleExpert = () => expertOpt.use();
    var mainMenu = function settings() {
        var menu = Settings;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, game.width, game.height);

        var w = game.width * .8;
        ctx.translate(game.width * .1, 0);
        // ctxZoom(0, 0, w, game.height);
        ctx.fillStyle = "#ccc";
        ctx.beginPath();
        {
            let r = .25 * w;
            let h = game.height;
            ctx.moveTo(r, 0);
            ctx.lineTo(w - r, 0);
            ctx.quadraticCurveTo(w, 0, w, 0 + r);
            ctx.lineTo(w, h - r);
            ctx.quadraticCurveTo(w, h, w - r, h);
            ctx.lineTo(r, h);
            ctx.quadraticCurveTo(0, h, 0, h - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
        }
        ctx.fill();
        var h = game.height/10;
        ctx.font = `${h/2}px Josefin Sans`;
        var txt = menu.label;
        var wid = ctx.measureText(txt).width;
        ctx.fillStyle = "#555";
        ctx.fillText(txt, (w - wid)*.5, h * 0.8);

        var i = 0;
        for(let item of menu.items) {
            let y = h * 1.6 + (i) * h * 0.8;
            if(item instanceof Toggle) {
                txt = `${item.value? "O": "X"} ${item.label}`;
                var wid = ctx.measureText(txt).width;
                txt = item.value? "O ": "X ";
                var wid2 = ctx.measureText(txt).width;
                ctx.fillStyle = i == menu.item? "#33b": "#555";
                ctx.fillText(item.label, wid2 + (w - wid)*.5, y);

                ctx.strokeStyle = "#222";
                ctx.lineWidth = h/20;
                ctx.strokeText(txt, (w - wid)*.5, y);
                ctx.fillStyle = States.color(item.value);

                ctx.fillStyle = item.value? "#5f5": "#f55";
                ctx.fillText(txt, (w - wid)*.5, y);
            }else if(item instanceof States) {
                txt = `${item.value} ${item.label}`;
                var wid = ctx.measureText(txt).width;
                txt = item.value+" ";
                var wid2 = ctx.measureText(txt).width;
                ctx.fillStyle = i == menu.item? "#33b": "#555";
                ctx.fillText(item.label, wid2 + (w - wid)*.5, y);

                ctx.strokeStyle = "#222";
                ctx.lineWidth = h/20;
                ctx.strokeText(txt, (w - wid)*.5, y);
                ctx.fillStyle = States.color(item.value);
                ctx.fillText(txt, (w - wid)*.5, y);
            }else if(item instanceof Slider) {
                txt = `XXXX ${item.label}`;
                var wid = ctx.measureText(txt).width;
                txt = "XXXX ";
                var wid2 = ctx.measureText(txt).width;
                ctx.fillStyle = i == menu.item? "#33b": "#555";
                ctx.fillText(item.label, wid2 + (w - wid)*.5, y);
                txt = "XXXX";
                wid2 = ctx.measureText(txt).width;

                ctx.lineWidth = h/20;
                ctx.strokeStyle = "#222";
                ctx.fillStyle = "#555";
                ctx.fillRect((w-wid)*.5, y - h * .4, wid2, h/2);
                ctx.fillStyle = "#33b";
                ctx.fillRect((w-wid)*.5, y - h * .4, wid2 * item.slider, h/2);
                ctx.strokeRect((w-wid)*.5, y - h * .4, wid2, h/2);
            }else if(item instanceof Button) {
                txt = `${item.label}`;
                var wid = ctx.measureText(txt).width;
                ctx.fillStyle = i == menu.item? "#33b": "#555";
                ctx.fillText(item.label, (w - wid)*.5, y);
            }
            ++i;
        }

        if(keys.hold("Space")) {
            let item = menu.items[menu.item];
            item?.use();
        }
        if(keys.hold("ArrowLeft")) {
            let item = menu.items[menu.item];
            item?.use(Input.Left);
        }
        if(keys.hold("ArrowRight")) {
            let item = menu.items[menu.item];
            item?.use(Input.Right);
        }
        if(keys.hold("ArrowDown")) {
            let item = menu.items[menu.item];
            item?.use(Input.Down);
        }
        if(keys.hold("ArrowUp")) {
            let item = menu.items[menu.item];
            item?.use(Input.Up);
        }
        if(keys.hold("KeyS")) {
            menu.item = loop(
                menu.item + 1,
                menu.items.length
            );
        }
        if(keys.hold("KeyW")) {
            menu.item = loop(
                menu.item - 1,
                menu.items.length
            );
        }
        if(keys.use("KeyA")) {
            menu.item = 0;
        }
        if(keys.use("KeyD")) {
            menu.item = menu.items.length - 1;
        }
        if(keys.use("Escape")) {
            mainMenu.active = false;
        }

        ctx.resetTransform();
    };
}
//init.js
{
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");
    
    window.run_key = RUN_KEY;
    var drawCreation = false;
    var scale = 40;
    var sf = 1/20;

    var gone;
    if(Enviroment == "Sololearn") gone = true;
    onblur = () => {
        gone = true;
        keys.clear();
    };
    onfocus = () => {
        gone = false;
        whenFocus();
    };
    var whenFocus = () => {};

    var zoomMatrix = function(x, y, w, h) {
        return Object.assign(new DOMMatrix(), {
            a: w, b: 0, c: 0,
            d: h, e: x, f: y
        });
    };

    var {PI, cos, sin, tan, round, sign, sqrt, abs, atan2: atan, min, max, floor, ceil} = Math;
    var dist = (x, y) => sqrt(x * x + y * y);
    var loop = (value, max) => (value % max + max) % max;
    var rotate = (value, range) =>
    {
        if(value > +range/2) value -= range;
        if(value < -range/2) value += range;
        return value;
    };
    var randomOf = ([...list]) => list[floor(random(list.length))];
    var lrandomOf = ([...list]) => list[floor(lehmer() * (list.length))];
    var random = (max=1, min=0) => lehmer() * (max - min) + min;
    var rDis = (a, b, c=(PI * 2)) => rotate(loop(b - a, c), c);
    var PI2 = PI * 2;
    var srand = () => {
        var rad = random(PI2);
        var c = cos(rad);
        var s = sin(rad);
        var a = c + s + 2;
        return a/4;
    };
    var weight = function weight(weights) {
        let total = 0;
        for(let id in weights) {
            let value = weights[id];
            total += value;
        }
        let acu = 0;
        let opt = random() * total;
        let chosen = 0;
        for(let id in weights) {
            let value = weights[id];
            if(acu < opt) {
                chosen = id;
            }
            acu += value;
        }
        return isNaN(chosen)? chosen: +chosen;
    }
    var lehmer = () => {
        lehmer.seed += 0xe120fc15;
        var tmp = lehmer.seed;
        tmp = tmp * 0x4a39b70d;
        tmp = (tmp >> 16) ^ tmp;
        tmp = tmp * 0x12fad5c9;
        return 2 * ((tmp >> 16) ^ tmp)/0xffffffff;
    };
    lehmer.seed = floor(random() * 108340204802);

    /**@type {zoom}*/
    var ctxZoom = zoom.bind(ctx);
    onresize = () =>
    {
        // game.length = min(innerHeight, innerWidth);
        game.width = innerWidth;
        game.height = innerHeight;
        canvas.height = game.height;
        canvas.width = game.width;
        // loader.canvas.height = game.height;
        // loader.canvas.width = game.width;

        rescale();
        game.updateBackground();

        // game.w = game.width/scale;
        // game.h = game.height/scale;
        // game.l = mapSize;
    };
    var rescale = () => {
        var scaleX = game.width/game.w;
        var scaleY = game.height/game.h;
        scale = min(scaleX, scaleY) * game.zoomL;
    };
    var mouse = {x: 0, y: 0, d: 0, s: 0};
    if(!window.mobileDebug) {
        oncontextmenu = (e) => (mouse.d = 2, onmousemove(e), e.preventDefault());
        onmousedown = (e) => (mouse.d = 1, onmousemove(e));
        onmouseup = (e) => (mouse.d = 0, onmousemove(e));
        onmousemove = ({pageX: x, pageY: y}) => (mouse.x = x, mouse.y = y);
    }

    // ontouchstart = (e) => [...e.changedTouches].forEach(touch => onmousedown(touch));
    // ontouchmove = (e) => [...e.changedTouches].forEach(touch => onmousemove(touch));
    // ontouchend = (e) => [...e.changedTouches].forEach(touch => onmouseup(touch));
}
{//game.js
    let background = document.createElement("canvas");
    let bctx = background.getContext("2d");

    var game = {
        zoom(x, y, l=1, w=1, r, fx, fy, ctx) {
            ctx = ctx || this.ctx;
            x += this._x;
            y += this._y;
            x *= scale;
            y *= scale;
            l *= scale;
            w *= scale;
            ctx.zoom(x, y, l, w, r);
            if(fx) {
                ctx.translate(.5, .5);
                ctx.scale(-1, 1);
                ctx.translate(-.5, -.5);
            }
            if(fy) {
                ctx.translate(-.5, .5);
                ctx.scale(1, -1);
                ctx.translate(-.5, -.5);
            }
        },
        scale(ctx) {
            ctx = ctx || this.ctx;
            ctx.scale(scale, scale);
            ctx.translate(game._x, game._y);
        },
        background, bctx,
        updateBackground() {
            var ctx = bctx;
            background.width = 64 * (game.w+2);
            background.height = 64 * (game.h+2);

            if(!this.color || !this.color2) return;
            
            ctx.resetTransform();
            ctx.scale(64, 64);
            ctx.translate(1, 1);
            ctx.fillStyle = this.color2(game.w, game.h, scale/game.zoomL);
            ctx.fillRect(0, 0, game.w, game.h);
            ctx.fillStyle = this.color(game.w, game.h, scale/game.zoomL);
            var drawTile = function drawTile(x, y, tiles=mapTiles, ctx=game.ctx) {
                function edge(x, y) {
                    if((x == -1 || x == game.w) || (y == -1 || y == game.h)) {
                        return !((x < -1 || x > game.w) || (y < -1 || y > game.h))
                    }
                }
                var res = [];
                for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
                {
                    dx = floor(dx + x);
                    dy = floor(dy + y);
                    if(edge(dx, dy)) res.push(1);
                    else if(outOfBounds(dx, dy)) res.push(0);
                    else if(tiles[Index(dx, dy)]) res.push(1);
                    else res.push(0);
                }
                var [t, b, l, r, tl, bl, tr, br] = res;

                var m = 0.02;
                var o = .3;
                x = x - m;
                y = y - m;
                var a = x + o;
                var g = x + 1 - o;
                var c = x + 1 + m;
                var d = y + o;
                var e = y + 1 - o;
                var f = y + 1 + m;
                ctx.beginPath();
                ctx.moveTo(a, y);
                if(t || r || tr) {
                    ctx.lineTo(c, y);
                }else{
                    ctx.lineTo(g, y);
                    ctx.quadraticCurveTo(c, y, c, d);
                }
                if(b || r || br) {
                    ctx.lineTo(c, f);
                }else{
                    ctx.lineTo(c, e);
                    ctx.quadraticCurveTo(c, f, g, f);
                }
                if(b || l || bl) {
                    ctx.lineTo(x, f)
                }else{
                    ctx.lineTo(a, f);
                    ctx.quadraticCurveTo(x, f, x, e);
                }
                if(t || l || tl) {
                    ctx.lineTo(x, y);
                }else{
                    ctx.lineTo(x, d);
                    ctx.quadraticCurveTo(x, y, a, y);
                }
                ctx.closePath();
                ctx.fill();
            };
            var drawSpace = function drawSpace(x, y, tiles=mapTiles, ctx=game.ctx) {
                function edge(x, y) {
                    return (x == -1 || x == game.w) || (y == -1 || y == game.h);
                }
                if(edge(x, y)) return;
                var res = [];
                for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
                {
                    dx += x;
                    dy += y;
                    if(edge(dx, dy)) res.push(1);
                    else if(outOfBounds(dx, dy)) res.push(0);
                    else if(tiles[Index(dx, dy)]) res.push(1);
                    else res.push(0);
                }
                var [t, b, l, r] = res;

                if(!(t || b || l || r)) return;

                var m = 0.01;
                x = x - m;
                y = y - m
                var o = .5;
                var a = x + o;
                var g = x + 1 - o;
                var c = x + 1 + m;
                var d = y + o;
                var e = y + 1 - o;
                var f = y + 1 + m;
                ctx.beginPath();
                if(t && r) {
                    ctx.moveTo(a, y);
                    ctx.lineTo(g, y);
                    ctx.quadraticCurveTo(c, y, c, d);
                    ctx.lineTo(c, y);
                    var dr = true;
                }
                if(b && r) {
                    ctx.moveTo(c, y);
                    ctx.lineTo(c, e);
                    ctx.quadraticCurveTo(c, f, g, f);
                    ctx.lineTo(c, f);
                    var dr = true;
                }
                if(b && l) {
                    ctx.moveTo(c, f);
                    ctx.lineTo(a, f);
                    ctx.quadraticCurveTo(x, f, x, e);
                    ctx.lineTo(x, f);
                    var dr = true;
                }
                if(t && l) {
                    ctx.moveTo(x, f);
                    ctx.lineTo(x, d);
                    ctx.quadraticCurveTo(x, y, a, y);
                    ctx.lineTo(x, y);
                    var dr = true;
                }
                if(dr) {
                    ctx.closePath();
                    ctx.fill();
                }
            };
            for(let x = -1; x <= game.w; x++) for(let y = -1; y <= game.h; y++)
            {
                let i = Index(x, y);
                if(mapTiles[i] || outOfBounds(x, y)) {
                    drawTile(x, y, mapTiles, ctx);
                }else{
                    drawSpace(x, y, mapTiles, ctx);
                }
            }

        },
        get zw() {return this.w/this.zoomL},
        get zh() {return this.h/this.zoomL},
        update() {
            function snapTo(num, to, m) {
                return num + m * (to - num);
            }

            var m = zoomSpeed;
            var zoom = zoomLevel;
            if(this.zoomO) zoom = this.zoomO;
            if(this.zoomL != zoom)
            {
                var value = snapTo(this.zoomL, zoom, m);
                var sw = innerWidth/scale * .5;
                var sh = innerHeight/scale * .5;
                var w = sw - game._x;
                var h = sh - game._y;
                game._x += w;
                game._y += h;
                game._x = (game._x * this.zoomL)/value;
                game._y = (game._y * this.zoomL)/value;
                game._x -= w;
                game._y -= h;
                var w = sw - game.x;
                var h = sh - game.y;
                game.x += w;
                game.y += h;
                game.x = (game.x * this.zoomL)/value;
                game.y = (game.y * this.zoomL)/value;
                game.x -= w;
                game.y -= h;
                this.zoomL = value;
                rescale();
            }
            var m = panSpeed;
            if(game._x != game.x) {
                game._x = snapTo(game._x, game.x, m);
            }
            if(game._y != game.y) {
                game._y = snapTo(game._y, game.y, m);
            }
        },
        camera() {
            delete this.zoomO;
            if(worldSelect.active) {
                let p = 2;

                minX = -p;
                maxX = game.w + p;
                minY = -p;
                maxY = game.h + p;

                var zoomX = game.w/(maxX - minX);
                var zoomY = game.h/(maxY - minY);
                let zoomL = min(zoomX, zoomY);
                if(zoomL < 0.5) zoomL = 0.5;
                if(zoomL > 2) zoomL = 2;
                this.zoomO = zoomL;
                var px = (minX + maxX)*.5;
                var py = (minY + maxY)*.5;

                let s = 1/scale;
                game.x = (game.zw - (innerWidth * s)) * -.5;
                game.y = (game.zh - (innerHeight * s)) * -.5;
                // s = player.s * .5;
                game.x += game.zw * .5 - px;
                game.y += game.zh * .5 - py;
            }else{
                if(cameraState == "screen") {
                    let s = 1/scale;
                    game.x = (game.w - (innerWidth * s)) * -.5;
                    game.y = (game.h - (innerHeight * s)) * -.5;
                    if(zoomLevel > 1) this.zoomO = 1;
                }
                if(cameraState == "player") {
                    let s = 1/scale;
                    game.x = (game.zw - (innerWidth * s)) * -.5;
                    game.y = (game.zh - (innerHeight * s)) * -.5;
                    let x = 0;
                    let y = 0;
                    s = 0;

                    for(let blob of mains) {
                        x += blob.x;
                        y += blob.y;
                        s += blob.s;
                    }
                    
                    s *= .5;
                    s /= mains.length;
                    x /= mains.length;
                    y /= mains.length;

                    game.x += game.zw * .5 - x - s;
                    game.y += game.zh * .5 - y - s;
                }
                if(cameraState == "mouse") {
                    let s = 1/scale;
                    game.x = (game.zw - (innerWidth * s)) * -.5;
                    game.y = (game.zh - (innerHeight * s)) * -.5;

                    // var player = enemies[0];
                    let px = 0;
                    let py = 0;
                    let ps = 0;

                    for(let blob of mains) {
                        px += blob.x;
                        py += blob.y;
                        ps += blob.s;
                    }
                    
                    ps *= .5;
                    ps /= mains.length;
                    px /= mains.length;
                    py /= mains.length;

                    s = ps * .5;
                    game.x += game.zw * .5 - px - s;
                    game.y += game.zh * .5 - py - s;

                    let {x, y} = mouse;
                    x -= innerWidth/2;
                    y -= innerHeight/2;
                    x = x/scale;
                    y = y/scale;
                    game.x -= x;
                    game.y -= y;
                }
                if(cameraState == "auto") {
                    let arr = enemies.filter(blob => !(blob.remove || (blob.team & TEAM.BULLET)));
                    let p = 1;
                    if(loader.delay > 1 || !arr.length) {
                        minX = -p;
                        maxX = game.w + p;
                        minY = -p;
                        maxY = game.h + p;
                    }else{
                        var xa = arr.map(blob => blob.x + blob.s*.5);
                        var ya = arr.map(blob => blob.y + blob.s*.5);
                        var minX = min(...xa) - p;
                        var maxX = max(...xa) + p;
                        var minY = min(...ya) - p;
                        var maxY = max(...ya) + p;
                    }
                    var zoomX = game.w/(maxX - minX);
                    var zoomY = game.h/(maxY - minY);
                    let zoomL = min(zoomX, zoomY);
                    if(zoomL < 0.5) zoomL = 0.5;
                    if(zoomL > 2) zoomL = 2;
                    this.zoomO = zoomL;
                    var px = (minX + maxX)*.5;
                    var py = (minY + maxY)*.5;

                    let s = 1/scale;
                    game.x = (game.zw - (innerWidth * s)) * -.5;
                    game.y = (game.zh - (innerHeight * s)) * -.5;
                    // s = player.s * .5;
                    game.x += game.zw * .5 - px;
                    game.y += game.zh * .5 - py;
                }
                if(lockToEdges) {
                    var sw = innerWidth/scale;
                    if(sw >= game.w) {
                        game.x = (game.w - sw) * -.5;
                    }else{
                        let m = sw - game.w;
                        if(game.x > 0) game.x = 0;
                        if(game.x < m) game.x = m;
                    }
                    var sh = innerHeight/scale;
                    if(sh >= game.h) {
                        game.y = (game.h - sh) * -.5;
                    }else{
                        let m = sh - game.h;
                        if(game.y > 0) game.y = 0;
                        if(game.y < m) game.y = m;
                        
                    }
                }
            }
        },
        ctx,
        length: 0,
        height: 0,
        width:  0,
        zoomL: 1,
        _x: 0,
        _y: 0,
        x: 0,
        y: 0,
        w: 15,
        h: 9,
        l: 0,
        steps: 10,
        get step() {return this._step * this.stepM},
        _step: 0.1,
        stepM: 1
    };
}
var TIME = 0;
//main.js
{
    var Index = (x, y) => {
        return x + y * game.w;
    };
    var Coords = i => {
        var x = i % game.w;
        return [x, (i - x)/game.w];
    };
    var outOfBounds = function outOfBounds(x, y) {
        return (x < 0) || (y < 0) || (x >= game.w) || (y >= game.h);
    }
    var mapTiles = [];
    var delay = t => new Promise(r => setTimeout(r, t));
    async function mazeAi() {
        var a = ceil(game.w/2);
        var h = ceil(game.h/2);
        var Index = (x, y) => {
            return x + y * a;
        };
        var Coords = i => {
            var x = i % a;
            return [x, (i - x)/a];
        };
        function outOfBounds(x, y) {
            return (x < 0) || (y < 0) || (x >= a) || (y >= h);
        }
        var stack = [];
        var visited = new Set;
        var test = [];
        if(false) {
        /**[t, b, l, r]*/
        var tile = [0];
        }
        /**@type {tile[]}*/
        var tiles = [];
        for(let x = 0; x < a; x++) for(let y = 0; y < h; y++)
        {
            tiles[Index(x, y)] = [0, 0, 0, 0];
        }
        async function draw() {
            if(!drawCreation) return;
            await delay(100);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);
            
            for(let x = 0; x < a; x++) for(let y = 0; y < h; y++)
            {
                let [t, b, l, r] = tiles[Index(x, y)];
                let mx = x + .5, my = y + .5;
                ctx.beginPath();
                ctx.arc(mx, my, .2, 0, PI2);
                ctx.fillStyle = test.includes(Index(x, y))? "blue": "yellow";
                ctx.fill();
                ctx.beginPath();
                if(t)
                {
                    ctx.moveTo(mx, my);
                    ctx.lineTo(mx, my - 1);
                }
                if(b)
                {
                    ctx.moveTo(mx, my);
                    ctx.lineTo(mx, my + 1);
                }
                if(l)
                {
                    ctx.moveTo(mx, my);
                    ctx.lineTo(mx - 1, my);
                }
                if(r)
                {
                    ctx.moveTo(mx, my);
                    ctx.lineTo(mx + 1, my);
                }
                ctx.lineWidth = 0.01;
                ctx.strokeStyle = "white";
                ctx.stroke();
            }
            ctx.resetTransform();
        }
        var max = a * h;
        test = [floor(lehmer() * max)];
        while(visited.size < max) {
            let arr = [];
            for(let i of test)
            {
                var [x, y] = Coords(i);

                let res = [[0, 0, -1], [1, 0, 1], [2, -1, 0], [3, 1, 0]].map(([i, dx, dy]) => (
                    [i, [x + dx, y + dy]]
                )).filter(([i, [x, y]]) => {
                    if(outOfBounds(x, y) || (visited.has(Index(x, y)))) {
                        return false;
                    }
                    return true;
                });
                visited.add(i);
                if(res.length) {
                    stack.push(Index(x, y));
                    var [w, [x, y]] = lrandomOf(res);
                    tiles[i][w] = 1;
                    let i2 = Index(x, y);
                    arr.push(i2);
                }else{
                    let i = stack.pop();
                    let [x, y] = Coords(i);
                    arr.push(Index(x, y));
                }
            }
            test = arr;
            await draw();
        }
        for(let x = 1; x < a - 1; x++) for(let y = 1; y < h - 1; y++)
        {
            let tile = tiles[Index(x, y)];
            for(let i = 0; i < 4; i++) {
                if(lehmer() < .1) tile[i] = 1;
            }
        }
        return tiles;
    }
    var init = async function start()
    {
        try{
        var tiles = await mazeAi();
        for(let x = 0; x < game.w; x++) for(let y = 0; y < game.h; y++)
        {
            let i = Index(x, y);
            mapTiles[i] = 0;
        }
        // console.log(tiles);
        // for(let x = 0; x < a; x++) for(let y = 0; y < b; y++)
        // {
        //     let mx = x * 2, my = y * 2;
        //     let tile = tiles[x + y * a];
        //     // console.log(x, y, x + y * a, tile);
        //     if(tile[0]) mapTiles[Index(mx, my - 1)] = 0;
        //     if(tile[1]) mapTiles[Index(mx, my + 1)] = 0;
        //     if(tile[2]) mapTiles[Index(mx - 1, my)] = 0;
        //     if(tile[3]) mapTiles[Index(mx + 1, my)] = 0;
        // }
        player = new Gunner().spawn();
        enemies.push(player);
        startLevel();
        Settings.load();
        }catch(err) {console.error(err)}
        main();
    }
    var ms = 1000/50;
    var nextFrame = () => {
        setTimeout(() => {
            if(gone) {
                whenFocus = main;
            }else{
                main();
            }
        }, ms);
    };
    var player;
    var lastI = -1;
    function main()
    {
        try{
        if(RUN_KEY != window.run_key) return;
        if(mainMenu.active) mainMenu();
        else if(worldSelect.active) worldSelect();
        else world();
        nextFrame();
        if(Host) {
            sendUpdate();
        }
        }catch(err) {console.error(err)}
    }
    var world = function world() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, innerWidth, innerHeight);

        if(!worldSelect.active) {
            if(creator) {
                if(mouse.d)
                {
                    let {x, y} = mouse;
                    x = floor(x/scale - game._x);
                    y = floor(y/scale - game._y);
                    let i = Index(x, y);
                    if(lastI != i)
                    {
                        if(mouse.d == 1 && edit)
                        {
                            mapTiles[i] = +!mapTiles[i];
                            game.updateBackground();
                            // console.log(mapTiles);
                        }
                        else if(mouse.d == 2)
                        {
                            // var blob = new Test;
                            // blob.x = x + .2;
                            // blob.y = y + .2;
                            // enemies.push(blob);
                            // mapTiles[i] = 0;
                            // // mouse.d = 0;
                            edit = !edit;
                            // if(!enemies.includes(player)) {
                            //     enemies.push(player);
                            //     player.remove = false;
                            // }
                        }
                    }
                    lastI = i;
                }
                else
                {
                    lastI = -1;
                }
            }
            if(keys.use("Escape")) {
                mainMenu.active = true;
            }
            if(keys.use("Digit0")) setCam(0);
            if(keys.use("Digit1")) setCam(1);
            if(keys.use("Digit2")) setCam(2);
            if(keys.use("Digit3")) setCam(3);
            if(keys.use("Digit4")) setCam(4);

            if(keys.hold("Equal")) modZoom(1);
            if(keys.hold("Minus")) modZoom(-1);

            if(keys.use("Enter")) {
                console.log(Hex(mapTiles.join("")));
            }
            var X_button = false;
            var Menu = false;
            let pads = navigator.getGamepads?.();
            if(pads) for(let pad of pads) {
                if(pad?.buttons[2].value) {
                    X_button = true;
                }
                if(pad?.buttons[8].value) {
                    Menu = true;
                }
            };
            {
                button.resize(0, 0, scale, scale);
                button.draw();
                if(buttonClick(button, 1, 1)) {
                    Menu ||= true;
                }
            }
            if(keys.use("Backspace") || Menu) {
                worldSelect.active = true;
                bosses.clear();
            }
            let allDead = true;
            for(let blob of mains) {
                if(!(blob.dead || blob.remove)) {
                    allDead = false;
                    break;
                }
            }
            if(allDead) {
                button.resize(0, 0, game.width, game.height);
                button.draw();
                if(buttonClick(button, 0, 1)) {
                    X_button ||= true;
                }
            }
            if(keys.use("Space") || X_button) {
                if(allDead) {
                    --level;
                    mapTiles = [];
                    game.updateBackground();
                    loader.enemies = [];
                    loader.tiles = [];
                    loader.load();
                    worldSelect.spawn();
                }
            }
        }

        game.update();
        game.camera();

        ctx.strokeStyle = "grey";
        ctx.lineWidth = 0.01;
        {
            let gx = game._x;
            if(loader.dir) {
                game._x -= game.w * 2 * loader.dir * (1 - (loader.delay)/loader.time);
                alpha = 1;
            }
            {
                // game.scale();
                // ctx.fillStyle = game.color2(game.w, game.h, scale/game.zoomL);
                // ctx.fillRect(0, 0, game.w, game.h);
                // ctx.fillStyle = game.color(game.w, game.h, scale/game.zoomL);
                var drawTile = function drawTile(x, y, tiles=mapTiles, ctx=game.ctx) {
                    function edge(x, y) {
                        if((x == -1 || x == game.w) || (y == -1 || y == game.h)) {
                            return !((x < -1 || x > game.w) || (y < -1 || y > game.h))
                        }
                    }
                    var res = [];
                    for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
                    {
                        dx = floor(dx + x);
                        dy = floor(dy + y);
                        if(edge(dx, dy)) res.push(1);
                        else if(outOfBounds(dx, dy)) res.push(0);
                        else if(tiles[Index(dx, dy)]) res.push(1);
                        else res.push(0);
                    }
                    var [t, b, l, r, tl, bl, tr, br] = res;

                    var m = 0.02;
                    var o = .3;
                    x = x - m;
                    y = y - m;
                    var a = x + o;
                    var g = x + 1 - o;
                    var c = x + 1 + m;
                    var d = y + o;
                    var e = y + 1 - o;
                    var f = y + 1 + m;
                    ctx.beginPath();
                    ctx.moveTo(a, y);
                    if(t || r || tr) {
                        ctx.lineTo(c, y);
                    }else{
                        ctx.lineTo(g, y);
                        ctx.quadraticCurveTo(c, y, c, d);
                    }
                    if(b || r || br) {
                        ctx.lineTo(c, f);
                    }else{
                        ctx.lineTo(c, e);
                        ctx.quadraticCurveTo(c, f, g, f);
                    }
                    if(b || l || bl) {
                        ctx.lineTo(x, f)
                    }else{
                        ctx.lineTo(a, f);
                        ctx.quadraticCurveTo(x, f, x, e);
                    }
                    if(t || l || tl) {
                        ctx.lineTo(x, y);
                    }else{
                        ctx.lineTo(x, d);
                        ctx.quadraticCurveTo(x, y, a, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                };
                var drawSpace = function drawSpace(x, y, tiles=mapTiles, ctx=game.ctx) {
                    function edge(x, y) {
                        return (x == -1 || x == game.w) || (y == -1 || y == game.h);
                    }
                    if(edge(x, y)) return;
                    var res = [];
                    for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
                    {
                        dx += x;
                        dy += y;
                        if(edge(dx, dy)) res.push(1);
                        else if(outOfBounds(dx, dy)) res.push(0);
                        else if(tiles[Index(dx, dy)]) res.push(1);
                        else res.push(0);
                    }
                    var [t, b, l, r] = res;

                    if(!(t || b || l || r)) return;

                    var m = 0.01;
                    x = x - m;
                    y = y - m
                    var o = .5;
                    var a = x + o;
                    var g = x + 1 - o;
                    var c = x + 1 + m;
                    var d = y + o;
                    var e = y + 1 - o;
                    var f = y + 1 + m;
                    ctx.beginPath();
                    if(t && r) {
                        ctx.moveTo(a, y);
                        ctx.lineTo(g, y);
                        ctx.quadraticCurveTo(c, y, c, d);
                        ctx.lineTo(c, y);
                        var dr = true;
                    }
                    if(b && r) {
                        ctx.moveTo(c, y);
                        ctx.lineTo(c, e);
                        ctx.quadraticCurveTo(c, f, g, f);
                        ctx.lineTo(c, f);
                        var dr = true;
                    }
                    if(b && l) {
                        ctx.moveTo(c, f);
                        ctx.lineTo(a, f);
                        ctx.quadraticCurveTo(x, f, x, e);
                        ctx.lineTo(x, f);
                        var dr = true;
                    }
                    if(t && l) {
                        ctx.moveTo(x, f);
                        ctx.lineTo(x, d);
                        ctx.quadraticCurveTo(x, y, a, y);
                        ctx.lineTo(x, y);
                        var dr = true;
                    }
                    if(dr) {
                        ctx.closePath();
                        ctx.fill();
                    }
                };
                // for(let x = -1; x <= game.w; x++) for(let y = -1; y <= game.h; y++)
                // {
                //     let i = Index(x, y);
                //     if(loader.delay) {
                //         if(mapTiles[i] || outOfBounds(x, y)) {
                //             ctx.fillRect(x, y, 1, 1);
                //         }
                //     }else{
                //         if(mapTiles[i] || outOfBounds(x, y)) {
                //             drawTile(x, y);
                //         }else{
                //             drawSpace(x, y);
                //         }
                //     }
                // }
                game.scale();
                ctx.drawImage(game.background, -1, -1, game.w+2, game.h+2);
            }
            game.scale();
            if(worldSelect.active) for(let blob of enemies) {
                blob.draw();
            }
            game._x = gx;
        }
        ctx.resetTransform();
        var ENEMIES_ALIVE = 0;


        if(loader.delay) {
            var alpha = (1 - (loader.delay)/loader.time) * .5;
            // let octx = loader.ctx;
            let octx = ctx;
            // octx.globalCompositeOperation = "destination-out";
            // octx.fillStyle = "black";
            // octx.clearRect(0, 0, game.width, game.height);
            // octx.globalCompositeOperation = "source-over";
            // loader.canvas.width = innerWidth;
            // let color = `rgb(120, 120, 120, ${alpha})`;
            // ctx.fillStyle = color;
            let gx = game._x;
            if(loader.dir) {
                game._x += game.w * 2 * loader.dir * (loader.delay)/loader.time;
                alpha = 1;
                game.scale();
                octx.fillStyle = loader.color2(game.w, game.h, scale/game.zoomL);
                octx.fillRect(0, 0, game.w, game.h);
            }else{
                game.scale();
            }
            octx.globalAlpha = alpha;
            // game.scale(octx);
            octx.fillStyle = loader.color(game.w, game.h, scale/game.zoomL);
            for(let x = -1; x <= game.w; x++) for(let y = -1; y <= game.h; y++)
            {
                let i = Index(x, y);
                if(loader.tiles[i] || outOfBounds(x, y)) octx.fillRect(x-.01, y-.01, 1.02, 1.02);
                // if(loader.tiles[i] || outOfBounds(x, y)) drawTile(x, y, loader.tiles, octx);
                // else drawSpace(x, y, loader.tiles, octx);
            }
            for(let blob of loader.enemies) {
                blob.step(loader.tiles);
                blob.update(1 - (loader.delay)/100, loader.tiles);
                blob.drawWith(octx, {alpha});
            }
            game._x = gx;
            ctx.resetTransform();
            octx.resetTransform();
            --loader.delay;
            if(loader.delay == 50) {
                mapTiles = [];
                game.updateBackground();
            }
            if(loader.delay == 0) {
                loader.load();
            }
            // ctx.globalAlpha = alpha;
            // ctx.drawImage(loader.canvas, 0, 0);
            ctx.globalAlpha = 1;
        }

        ctx.resetTransform();

        for(let i = 0, e = enemies.length; i < e; i++)
        {
            let blob = enemies[i];
            blob.step();
            if(blob.team & TEAM.BAD) ++ENEMIES_ALIVE;
            if(blob.dead || blob.remove) continue;
            for(let j = 0; j < i; j++)
            {
                let them = enemies[j];
                if(them.dead || blob.remove) continue;
                blob.register(them);
                them.register(blob);
            }
        }
        if(!(worldSelect.active || loader.delay || ENEMIES_ALIVE)) {
            startLevel();
        }
        for(let a = 0; a < game.steps; a++) {
            for(let i = 0, e = enemies.length; i < e; i++)
            {
                let blob = enemies[i];
                if(blob.remove) continue;
                blob.update(blob.stepf);
                for(let j = 0; j < i; j++)
                {
                    let them = enemies[j];
                    if(them.remove) continue;
                    if(Entity.isTouching(blob, them))
                    {
                        if(blob instanceof Test && them instanceof Test) {
                            blob.remove = true;
                            them.remove = true;
                        }
                        var hit = Entity.hitTest(blob, them);
                        var coll = Entity.collTest(blob, them);
                        if(hit) {
                            blob.hit(them);
                            them.hit(blob);
                        }
                        if(coll) {
                            Entity.collide(blob, them);
                            blob.lcoll.set(them, 7);
                            them.lcoll.set(blob, 7);
                        }
                    }
                }
                if(blob.undo && blob.stepf <= game.step * 7) {
                    blob.stepf += game.step;
                    blob.x = blob.sx;
                    blob.y = blob.sy;
                }else blob.stepf = game.step;
                blob.undo = false;
            }
        }
        {//boss bar
            let i = 0;
            bosses.forEach(blob => {
                var l = 5;
                var w = game.width * 5/8;
                var x = (game.width - w)/2;
                var h = scale*.75;
                var y = game.height - (i * 1.5 + 1) * h - l/2;
                ctx.strokeStyle = blob.color;
                ctx.fillStyle = blob.color2 || blob.color;
                ctx.lineWidth = l;
                var hp = blob.hp;
                if(hp < 0) hp = 0;
                ctx.fillRect(x, y, w * (hp/blob.xhp), h);
                // if(blob.hp2) {
                //     var hp = blob.hp2;
                //     if(hp < 0) hp = 0;
                //     ctx.fillStyle = blob.color3 || blob.color2 || blob.color;
                //     ctx.fillRect(x, y, w * (hp/blob.xHp), h);
                // }
                ctx.strokeRect(x, y, w, h);
                blob?.drawBossIcon(ctx, x-h*.5, y, h);
                if(!enemies.includes(blob)) {
                    bosses.delete(blob);
                }
                ++i;
            });
        }
        if(!worldSelect.active) {
            for(let blob of enemies) {
                blob.draw();
            }
            ctx.zoom(0, 0, scale, scale);
            ctx.fillStyle = "red";
            ctx.fill(shape("X"));
            ctx.resetTransform();
        }
        ctx.resetTransform();
        enemies = enemies.filter(b => !b.remove);

        // ctx.strokeStyle = "red";
        // ctx.lineWidth = 1;
        // ctx.strokeRect(0, 0, innerWidth/2, innerHeight/2);
        if(Host) sendData({frame: 1});
    }
}
var bosses = new Set;
var drawImps = ["pen", "drawLine"];
{//entity.js
    var Entity = class Entity
    {
        register(enemy) {}
        isPlayer(what) {
            return (what.team & this.hits) && !(what.team & TEAM.BULLET);
        }
        onCollide() {}
        onSpawned() {}
        drawWith(ctx, obj) {
            // obj = {...this, ...obj};
            // for(let prop of drawImps) {
            //     obj[prop] = this[prop];
            // }
            // this.draw.call(obj, ctx);
            var old = {};
            for(let prop in obj) {
                old[prop] = this[prop];
                this[prop] = obj[prop];
            }
            this.draw(ctx);
            for(let prop in old) {
                this[prop] = old[prop];
            }
        }
        spawn(tiles=mapTiles)
        {
            do
            {
                this.x = random() * (game.w - this.s);
                this.y = random() * (game.h - this.s); 
            }
            while(this.nospawn(tiles));
            return this;
        }
        nospawn(tiles=mapTiles) {
            return this.inWall(0, tiles);
        }
        step(tiles=mapTiles) {
            this.ox = this.x;
            this.oy = this.y;
            this.vx *= this.f;
            this.vy *= this.f;
            if(!this.dead) this.tick?.(tiles);
            if(this.dead) {
                if(worldSelect.active) this.dead += 0.1;
                else ++this.dead;
            }
            if(this.lives) {
                if(this.dead >= DEAD * (this.expert? 2: 5)) {
                    this.hp += this.xhp;
                    this.dead = 0;
                    --this.lives;
                }
            }else{
                if(this.dead >= DEAD) {
                    this.delete();
                }
            }
            {
                let hp = this.calculateHp();
                if(hp <= 0) {
                    this.lives = 0;
                    this.hp = 0;
                }
            }
            if(!this.dead && this.hp <= 0) this.dead = 1;
            if(this.wallInv > 0) {
                if(!this.inWall(0, tiles)) {
                    this.wallInv = 0;
                }else this.wallTick();
            }
        }
        calculateHp() {
            var xhp = this.xhp;
            var hpv = this.hp + xhp * this.lives;
            // xhp *= this.ml;
            return hpv;
        }
        delete() {
            this.remove = 1;
        }
        update(m=1, tiles=mapTiles)
        {
            if(this.remove) return;
            this.sx = this.x;
            this.sy = this.y;
            this.movement(m, tiles);
            for(let [enemy, number] of this.lcoll) {
                if(--number) this.lcoll.set(enemy, number);
                else this.lcoll.delete(enemy);
            }
            if(this.inv) for(let [enemy, number] of this.inv) {
                if(--number) this.inv.set(enemy, number);
                else this.inv.delete(enemy);
            }
        }
        movement(m=1, tiles=mapTiles)
        {
            this.x += this.vx * m;
            this.inWall("x", tiles);
            this.y += this.vy * m;
            this.inWall("y", tiles);
            this.screenlock();
        }
        move(rad, spd=1)
        {
            if(this.dead) return;
            spd *= this.spd;
            var c = cos(rad),
                s = sin(rad);
            this.vx += c * spd;
            this.vy += s * spd;
        }
        screenlock()
        {
            var w = game.w - this.s;
            var h = game.h - this.s;
            var d = [0, 0];
            if(this.x < 0)
            {
                d[0] = 1;
                this.x = 0;
            }
            if(this.y < 0)
            {
                d[1] = 1;
                this.y = 0;
            }
            if(this.x > w)
            {
                d[0] = -1;
                this.x = w;
            }
            if(this.y > h)
            {
                d[1] = -1;
                this.y = h;
            }
            if(d[0] || d[1]) this.hitWall(...d);
        }
        static radian = (b, a) => {
            var s = ((a.s||0) - (b.s||0))*.5;
            return atan(a.y - b.y + s, a.x - b.x + s);
        };
        hitWall(x, y)
        {
            if(x)
            {
                this.vx = abs(this.vx) * x;
            }
            if(y)
            {
                this.vy = abs(this.vy) * y;
            }
        }
        wallCheck(a, tiles=mapTiles) {
            var w = this.w || this.s;
            var h = this.h || this.s;
            if(a) {
                if(this.wallInv) return;
                var o = a == "x"? "y": "x";
                var n = ["x", "y"].indexOf(a);
                var va = "v" + a;
                // if(a == "x") s = w;
                // else var s = h;
                var ma = this[a] - this["o"+a];
            }
            var sx = floor(this.x);
            var sy = floor(this.y);
            var bx = floor(this.x + w);
            var by = floor(this.y + h);

            ([sx, sy, bx, by] = [[sx, game.w], [sy, game.h], [bx, game.w], [by, game.h]].map(([n, m]) => {
                if(n < 0) return 0;
                if(n >= m-1) return m-1;
                return n;
            }));

            // var dir = [0, 0];

            var coords = [[sx, sy], [sx, by], [bx, sy], [bx, by]];
            /**@type {[number, number][]}*/
            var blocks = [];
            for(let arr of coords) {
                let [x, y] = arr;
                var tile = tiles[Index(x, y)];
                if(tile) {
                    blocks.push(arr);
                }else{
                    blocks.push(null);
                }
            }
            var barriers = blocks.filter(b => b);
            var total = barriers.length;

            if(a) {
                if(total) {
                    if(ma > 0) { //down
                        this[a] = [sx, sy][n] + (1 - this.s - 0.01);
                        if(a == "x") this.hitWall(-1, 0);
                        else if(a == "y") this.hitWall(0, -1);
                    }else{//up
                        this[a] = [bx, by][n] + 0.01;
                        if(a == "x") this.hitWall(1, 0);
                        else if(a == "y") this.hitWall(0, 1);
                    }
                }
            }
            return total;
        }
        inWall(a, tiles) {
            if(this.s > 1) {
                var wall = false;
                var s = this.s;
                var box = {x: 0, y: 0, vx: this.vx, vy: this.vy, w: 1, h: 1};
                {
                    box.hitWall = (x, y) => {
                        var sx = floor(Bx);
                        var sy = floor(By);
                        var bx = floor(Bx + box.w);
                        var by = floor(By + box.h);
                        var n = ["x", "y"].indexOf(a);
                        if(a) {
                            if(this["v"+a] > 0) { //down
                                this[a] = [sx, sy][n] + (1 - this.s - 0.01);
                                if(a == "x") this.hitWall(-1, 0);
                                else if(a == "y") this.hitWall(0, -1);
                            }else{//up
                                this[a] = box[a];
                                if(a == "x") this.hitWall(1, 0);
                                else if(a == "y") this.hitWall(0, 1);
                            }
                        }
                        // this.hitWall(x, y);
                    };
                }
                for(var ox = 0; ox < s; ox++) for(var oy = 0; oy < s; oy++) {
                    box.x = this.x + ox;
                    box.y = this.y + oy;

                    var Bx = box.x;
                    var By = box.y;

                    if(ox + 1 > s) {
                        box.w = s - ox;
                    }else box.w = 1;
                    if(oy + 1 > s) {
                        box.h = s - oy;
                    }else box.h = 1;

                    let res = this.wallCheck.call(box, a, tiles);
                    if(res) return;
                }
            }else return this.wallCheck(a, tiles);
        }
        static collTest(a, b)
        {
            if(a.nocoll & b.team || b.nocoll & a.team) return 0;
            if(a.lcoll?.has(b) || b.lcoll?.has(a)) return 0;
            return (a.coll & b.team) || (b.coll & a.team);
        }
        static hitTest(a, b)
        {
            if(a.hitref) a = a.hitref;
            if(b.hitref) b = b.hitref;
            if(a.inv?.has(b)) return;
            if(b.inv?.has(a)) return;
            //if(a.dead || a.remove) return;
            //if(b.dead || b.remove) return;
            if(a.nohit & b.team || b.nohit & a.team) return 0;
            return (a.hits & b.team) || (b.hits & a.team);
        }
        pen(ctx=game.ctx, {init, OFF=[], fill, stroke, scale=1, shape:shp=this.shape, r=0}, hp, zoom=1)
        {
            var {x, y, s, alpha=1} = this;
            if(scale != 1) {
                let mx = x+s*.5;
                let my = y+s*.5;
                s = s * scale;
                x = mx - s *.5;
                y = my - s *.5;
            }
            ctx.lineWidth = 0.1/scale;
            if(this.dead) alpha = .5;
            ctx.globalAlpha = alpha;

            var {zoom=1} = this;
            if(zoom) game.zoom(x, y, s, s, r, 0, 0, ctx);
            else ctx.zoom(x, y, s, s, r);

            var xhp = this.xhp;
            var hpv = this.hp + xhp * this.lives;
            xhp *= this.ml;
            var HP = 1;
            if(!isNaN(hp)) {
                if(hpv < xhp) {
                    HP = hpv/xhp;
                }
            }
            if(isNaN(hp)) hp = 0;

            var [x, y, w, h] = sprites.grab(shp, stroke, fill, HP, hp, OFF);
            init?.(ctx);
            ctx.drawImage(sprites.sheet, x, y, w, h, 0, 0, 1, 1);

            // if(fill) {
            //     ctx.drawImage(color(shp, fill), 0, 0, 1, 1);
            // }
            // if(stroke) {
            //     ctx.drawImage(color(shp+"S", fill), 0, 0, 1, 1);
            // }
            // if(!isNaN(hp)) {
            //     if(hpv < xhp) {
            //         ctx.restore();
            //     }
            // }

            ctx.globalAlpha = 1;
            ctx.strokeStyle = "red";
            ctx.resetTransform();
        }
        draw(ctx) {
            var r = atan(this.vy, this.vx)
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
        }
        static distance = (a, b) =>
        {
            var s = ((a.s||0) - (b.s||0))*.5;
            return dist(a.y - b.y + s, a.x - b.x + s);
        }
        static rawDistance = (a, b) =>
        {
            var s = ((a.s||0) - (b.s||0))*.5;
            return (a.y - b.y + s) ** 2 + (a.x - b.x + s) ** 2;
        }
        static hitbox(a, b)
        {
            var ar = a.x + a.s;
            var ab = a.y + a.s;
            var br = b.x + b.s;
            var bb = b.y + b.s;

            return a.x + a.s > b.x
                && b.x + b.s > a.x
                && a.y + a.s > b.y
                && b.y + b.s > a.y
        }
        sightCheck(blob) {
            var s = this.s * .5;
            var sx = this.x + s;
            var sy = this.y + s;
            var s = blob.s * .5;
            var ex = blob.x + s;
            var ey = blob.y + s;
            var hit = Test.lineCheck(sx, sy, ex, ey);
            return !hit;
        }
        sightCheckOLD(blob) {
            ctx.scale(scale, scale);
            var s = this.s * .5;
            var sx = this.x + s;
            var sy = this.y + s;
            var s = blob.s * .5;
            var ex = blob.x + s;
            var ey = blob.y + s;

            var see = false;

            var hit = Test.lineCheck(sx, sy, ex, ey);
            if(!hit) {
                see = true;
                // return true;
            }
            // ctx.strokeStyle = (!hit)? "green": "red";
            // ctx.beginPath();
            // ctx.lineWidth = 0.03;
            // ctx.moveTo(sx, sy);
            // ctx.lineTo(ex, ey);
            // ctx.stroke();

            var dx = ex - sx;
            var dy = ey - sy;
            var d = dist(dx, dy);

            var ux = dx/d * blob.s;
            var uy = dy/d * blob.s;

            ex += uy * .5;
            ey -= ux * .5;

            var hit = Test.lineCheck(sx, sy, ex, ey);
            if(!hit) {
                see = true;
                // return true;
            }
            // ctx.strokeStyle = (!hit)? "green": "red";
            // ctx.beginPath();
            // ctx.lineWidth = 0.03;
            // ctx.moveTo(sx, sy);
            // ctx.lineTo(ex, ey);
            // ctx.stroke();

            ex -= uy;
            ey += ux;

            var hit = Test.lineCheck(sx, sy, ex, ey);
            if(!hit) {
                see = true;
                // return true;
            }
            // ctx.strokeStyle = (!hit)? "green": "red";
            // ctx.beginPath();
            // ctx.lineWidth = 0.03;
            // ctx.moveTo(sx, sy);
            // ctx.lineTo(ex, ey);
            // ctx.stroke();
            ctx.resetTransform();

            return see;
        }
        static isTouching(a, b)
        {
            for(let box of a.boxes)
            {for(let bx of b.boxes)
            {if(Entity.hitbox(box, bx))
            {
                return 1;
            }}}
        }
        static collide(a, b)
        {
            var kx = a.vx - b.vx;
            var ky = a.vy - b.vy;
            var s = (b.s - a.s) * .5;
            var d = dist(b.x - a.x + s, b.y - a.y + s);
            var nx = (b.x - a.x + s)/d;
            var ny = (b.y - a.y + s)/d;

            var p = 2.2 * (nx * kx + ny * ky)/(b.m + a.m);
            a.vx = a.vx - p * b.m * nx;
            a.vy = a.vy - p * b.m * ny;
            b.vx = b.vx + p * a.m * nx;
            b.vy = b.vy + p * a.m * ny;

            a.onCollide();
            b.onCollide();

            a.undo = true;
            b.undo = true;
        }
        wallTick() {
            ++this.wallInv;
            if(this.wallInv == 20) {
                var save = new Wall_Fix(this);
                save.spawn();
                enemies.push(save);
            }
        }
        hit(who) {
            if(this.dead > 1) return;
            who.onHit(this.atk, this);
        }
        onHit(atk=0, who) {
            this.hp -= atk;
            (this.hitref || this).inv?.set(who?.hitref || who, 50);
            if(this.hp <= 0) {
                if(!this.lives) {
                    this.dead = 1;
                    this.m /= 10;
                    this.team = TEAM.DEAD;
                    this.hits = 0;
                    this.coll = 0;
                }else{
                    this.dead = 1;
                }
            }
        }
        boxes = [this];
        shape = "square";
        ox = 0; oy = 0;
        x = 0; y = 0;
        vx = 0; vy = 0;
        s = 0.4; f = 0.8;
        spd = 0.032;
        x = 0; y = 0;
        stepf = 0;
        m = 1; b = 1;
        wallInv = 0;
        atk = 1; hp = 1;
        xhp = 1;
        inv = new Map;
        dead = 0;
        lcoll = new Map;
        s = 0.4;
        lives = 0;
        ml = 1;
    }
}
var TEAM = {
    GOOD  : 1 << 0,
    ALLY  : 1 << 1,
    BAD   : 1 << 2,
    ENEMY : 1 << 3,
    BULLET: 1 << 4,
    DEAD  : 1 << 5
};
//player.js
{
    var Player = class Player extends Entity
    {
        color = "#55f";
        color2 = "#aaf";
        shape = "square.3";
        constructor(id=0) {
            super();
            this.id = id;
            if(multi) {
                this.hue = (id/(multi + 1)) * 360;
                this.safe = 360/((multi + 1) * 4);
            }
            if(worldSelect.active) {
                this.register = this.aiRegister||this.register;
            }
        }
        delete() {
            this.dead = 2;
        }
        hit(what) {
            if(what.dead) return;
            super.hit(what);
        }
        touchv2() {
            var {touch, touch2} = this;
            var mx = (this.x + this.s * .5 + game._x) * scale;
            var my = (this.y + this.s * .5 + game._y) * scale;
    
            //var inBattle = enemies.filter(blob => !(blob instanceof Player)).length;
    
            if(touch && touch.end) touch = false;
            if(!touch) touches.forEach(obj => {
                if(obj.sx < innerWidth/2 && obj != touch2 && !obj.end) {
                    touch = obj;
                }
            });
            if(!touch2 && !this.skl) touches.forEach(obj => {
                if(obj.sx > innerWidth/2 && obj != touch && !obj.end) {
                    touch2 = obj;
                }
            });
            if(touch) {
                var mrad = atan(touch.my, touch.mx);
                var dis = dist(touch.mx, touch.my);
                var inside = dis > scale;
                if(inside) {
                    this.move(mrad);
                    this.mrad = mrad;
                }
                this.touch = touch;
                //if(inBattle && !Survival) 
                touch.used = true;
                ctx.strokeStyle = inside? this.color: this.color2;
                ctx.beginPath();
                ctx.lineWidth = scale * .125;
                ctx.arc(touch.sx, touch.sy, scale, 0, PI2);
                ctx.stroke();
                ctx.lineWidth = scale * .125;
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.moveTo(touch.sx, touch.sy);
                ctx.lineTo(touch.x, touch.y);
                ctx.moveTo(mx, my);
                ctx.lineTo(mx + touch.mx, my + touch.my);
                ctx.stroke();
            }
            if(touch2) {
                this.touch2 = touch2;
                var hrad = atan(touch2.my, touch2.mx);
                var dis = dist(touch2.mx, touch2.my);
                var time = Date.now() - touch2.start;
                var overdue = time > ms * 10;
                var inside = dis > scale * 2;
                if(time > ms * 3 || touch2.end) {
                    if(inside) {
                        this.skill(hrad, mrad);
                    }else if(overdue || touch2.end) {
                        this.ability(overdue? 3: 1, mrad, hrad);
                    }
                }
                //if(inBattle)
                touch2.used = true;
                if(touch2.end) delete this.touch2;
                ctx.lineWidth = scale * .125;
                ctx.beginPath();
                ctx.arc(touch2.sx, touch2.sy, scale * 2, 0, PI2);
                ctx.strokeStyle = inside? this.color2: this.color;
                ctx.stroke();
                ctx.lineWidth = scale * .125;
                ctx.beginPath();
                ctx.strokeStyle = this.color2;
                ctx.moveTo(touch2.sx, touch2.sy);
                ctx.lineTo(touch2.x, touch2.y);
                ctx.moveTo(mx, my);
                ctx.lineTo(mx + touch2.x - touch2.sx, my + touch2.y - touch2.sy);
                ctx.stroke();
            }
        }
        spawn() {
            this.x = (game.w-this.s)*.5;
            this.y = (game.h-this.s)*.5;
            if(multi) {
                let m = this.id/(multi+1);
                let r = PI2 * m + PI*1.5;
                if(multi == 1) r -= PI*.5;
                let d = multi**.5 * .4;
                let c = cos(r) * d;
                let s = sin(r) * d;
                this.x += c;
                this.y += s;
            }
            return this;
        }
        tick()
        {
            if(worldSelect.active) {
                this.ai();
            }else{ 
                if(this.id == getExtras()) {
                    this.keys();
                    this.touchv2();
                }else{
                    this.pad();
                    this.online();
                }
            }
            if(this.hp < this.xhp) {
                this.hp += this.regen;
            }
            if(this.hp > this.xhp) {
                this.hp = this.xhp;
            }
            this.stats();
        }
        ai() {}
        update(m, t) {
            super.update(m, t);
            if(!worldSelect.active && this.dead) for(let main of mains) {
                if(!main.dead && Entity.isTouching(main, this)) {
                    this.revive();
                }
            }
        }
        pad() {
            var pads = navigator.getGamepads?.();
            var pad = pads?.[gamepads[this.id]];
            
            if(!pad) return;

            var x = dead(pad.axes[0], 1);
            var y = dead(pad.axes[1], 1);

            var dis = dist(x, y);
            var rad = atan(y, x);
            if(dis > 1) dis = 1;
            if(dis > 0.1) {
                this.mrad = rad;
                this.move(rad, dis);
            }

            var x = pad.axes[2];
            var y = pad.axes[3];

            var dis2 = dist(x, y);

            var mx = (this.x + this.s * .5);
            var my = (this.y + this.s * .5);

            ctx.lineWidth = .4 * this.s;
            ctx.beginPath();
            game.scale();
            ctx.globalAlpha = this.alpha;
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + x*this.s*1.5, my + y*this.s*1.5);

            var RT = dead(pad.buttons[7].value);
            if(dis2 && RT) {
                this.skill(atan(y, x), rad);
                ctx.strokeStyle = this.color2;
            }else ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.resetTransform();

            var A = pad.buttons[0].value;
            var LT = dead(pad.buttons[6].value);
            if(A || LT) {
                if(this.ab) this.ab = 3;
                else this.ab = 1;
                this.ability(this.ab, dis? rad: dis, atan(y, x));
            }else this.ab = 0;
        }
        online() {
            var len = gamepads.length;
            if(this.id < len) return;
            var arr = [...gamepads, ...online];
            var obj = arr[this.id];
            if(!obj) return;

            var {spd, rad, srad, abil} = obj[1];
            if(spd) {
                if(spd > 1) spd = 1;
                if(spd < 0) spd = 0;
                this.move(rad, spd);
            }
            if(!isNaN(srad)) {
                this.skill(srad, rad);
            }
            if(abil) {
                this.ability(abil, rad, srad);
            }
        }
        revive() {
            this.dead = 0;
            this.hp = this.xhp;
            this.team = TEAM.GOOD | TEAM.ALLY;
            this.coll = TEAM.ALLY | TEAM.ENEMY;
            this.hits = TEAM.BAD;
        }
        skill(rad, mrad) {}
        ability(key, mrad, srad) {}
        stats() {
            if(this.lastSkill) --this.lastSkill;
        }
        keys()
        {
            var x = 0, y = 0;

            if(keys.has("KeyD")) ++x;
            if(keys.has("KeyS")) ++y;
            if(keys.has("KeyA")) --x;
            if(keys.has("KeyW")) --y;

            if(x || y)
            {
                var mrad = atan(y, x);
                this.move(mrad, 1);
            }

            x = 0; y = 0;
            if(keys.has("ArrowRight")) ++x;
            if(keys.has("ArrowDown") ) ++y;
            if(keys.has("ArrowLeft") ) --x;
            if(keys.has("ArrowUp")   ) --y;

            if(x || y)
            {
                var srad = atan(y, x);
                this.skill(srad, mrad);
            }

            if(mouse.d) {
                let {x, y} = mouse;
                let s = this.s*.5;
                x = x/scale - game._x;
                y = y/scale - game._y;
                x -= this.x + s;
                y -= this.y + s;
                var srad = atan(y, x);
                this.skill(srad, mrad);
            }

            if(keys.has("ShiftRight")) {
                this.ability(keys.get("ShiftRight"), mrad, srad);
                keys.set("ShiftRight", 2);
            }else if(keys.has("ShiftLeft")) {
                this.ability(keys.get("ShiftLeft"), mrad, srad);
                keys.set("ShiftLeft", 2);
            }else if(keys.has("Space")) {
                this.ability(keys.get("Space"), mrad, srad);
                keys.set("Space", 2);
            }
        }
        team = TEAM.GOOD | TEAM.ALLY;
        coll = TEAM.ALLY | TEAM.ENEMY;
        hits = TEAM.BAD;
        regen = 0.01;
        hp = 2.5;
        xhp = 2.5;
    }
    var Guy = class Guy extends Player{
        constructor(i) {
            super(i);
            if(multi) {
                var {hue, safe} = this;
                this.color = `hsl(${hue}, 100%, 50%)`;
                this.color2 = `hsl(${hue}, 100%, 80%)`;
                this.color3 = `hsl(${hue+safe}, 100%, 80%)`;
            }
        }
        attack(rad) {
            if(!this.lastSkill) {
                if(!isNaN(rad)) {
                    this.move(rad, 3);
                    this.lastSkill = 5;
                    this.slash = !this.slash;
                    var sword = new Sword(this, rad, 3, this.slash);
                    sword.color = this.color3;
                    enemies.push(sword);
                }
            }
        }
        ability(key, rad) {
            this.attack(rad);
        }
        skill(rad) {
            this.attack(rad);
        }
        draw(ctx) {
            var r = atan(-this.vx, 0.5);
            this.pen(ctx, {fill: this.color}, 0);
            this.pen(ctx, {stroke: this.color});

            var init = ctx => ctx.translate(0, -1);
            this.pen(ctx, {init, shape: "link-hat", fill: this.color2, scale: 1, r, OFF: [0, 1]}, r);
            this.pen(ctx, {init, shape: "link-hat", stroke: this.color2, scale: 1, r});
        }
        ai() {
            var {target} = this;
            if(!target) {
                this.move(atan(this.vy, this.vx));
            }else{
                var rad = Entity.radian(this, target);
                var dis = Entity.distance(this, target);
                if(dis < 1) {
                    this.move(rad+PI);
                    if(this.hp > 2) {
                        this.skill(rad);
                    }else{
                        this.skill(rad+PI);
                    }
                }else if(dis > 2) {
                    if(this.hp > 2) {
                        this.skill(rad);
                        this.move(rad);
                    }else{
                        this.skill(rad+PI);
                        this.move(rad+PI);
                    }
                }else{
                    if(this.hp > 2) {
                        this.skill(rad);
                    }else{
                        this.move(rad+PI);
                        this.skill(rad+PI);
                    }
                }
            }

            delete this.target;
            delete this.clo;
        }
        aiRegister(enemy) {
            if(!(this.hits & enemy.team)) return;
            var bullet = enemy.team & TEAM.BULLET;
            var dis = Entity.rawDistance(this, enemy);

            var d = bullet? 3 * 3: 15 * 15;
            var a = dis < d && (!this.clo || dis < this.clo);
            if(!a || !this.sightCheck(enemy)) return;

            this.target = enemy;
            this.clo = dis;
        }
        xhp = 4.5;
        hp = 4.5;
        color = "#eda";
        color2 = "#5f5";
        color3 = "#bbb";
    };
    var Sword = class Sword extends Entity{
        constructor(parent, rad, time, rev) {
            super();
            this.parent = parent;
            this.rad = rad;
            time *= game.steps;
            this.time = time;
            this.maxt = time;
            this.rev = rev;
            
            this.parent = parent;
            this.color = parent.color;
            this.team = parent.team | TEAM.BULLET;
            this.hits = parent.hits;
            this.coll = parent.coll;
            // this.nocoll = TEAM.BULLET;
            Bullet.position(this, this.R, parent, 2);
            this.ox = this.x;
            this.oy = this.y;
            this.points = [];
            this.m = 0.1;
        }
        get R() {
            var delta = this.time/this.maxt;
            if(this.rev) delta = 1 - delta;
            var swoop = PI*.75;
            var start = this.rad - swoop*.5;
            return start + swoop * delta;
        }
        proj = 1;
        s = 1;
        atk = .5;
        update() {
            super.step();
            Bullet.position(this, this.R, this.parent, 2);
            this.vx = this.parent.vx;
            this.vy = this.parent.vy;
            this.ovx = this.vx;
            this.ovy = this.vy;
            var {x, y} = this;
            this.points.push({x, y});
            if(this.time) --this.time;
            else this.remove = true;
        }
        onHit(dmg, what) {
            super.onHit(what);
            this.remove = true;
        }
        onCollide() {
            this.parent.vx += this.vx - this.ovx;
            this.parent.vy += this.vy - this.ovy;
        }
        points = [];
        draw() {
            game.scale();
            var s = this.s*.5;
            ctx.lineWidth = s;
            ctx.strokeStyle = this.color;
            ctx.lineCap = "round";
            ctx.beginPath();
            let f = 1;
            if(this.old?.length) {
                for(let {x, y} of this.old) {
                    if(f) {
                        f = 0;
                        ctx.moveTo(x+s, y+s);
                    }else ctx.lineTo(x+s, y+s);
                }
                ctx.globalAlpha = 1;
            }
            for(let {x, y} of this.points) {
                if(f) {
                    f = 0;
                    ctx.moveTo(x+s, y+s);
                }else ctx.lineTo(x+s, y+s);
            }
            ctx.lineTo(this.x+s, this.y+s);
            this.old = [...this.points, {x: this.x, y: this.y}];
            ctx.stroke();
            ctx.resetTransform();
            this.points = [];
        }
    }
    var Gunner = class Gunner extends Player{
        rech = "#faa";
        constructor(id) {
            super(id);
            if(multi) {
                var {hue, safe} = this;
                hue += safe * .5;
                this.color = `hsl(${hue}, 100%, 50%)`;
                this.color2 = `hsl(${hue}, 100%, 80%)`;
                this.rech = `hsl(${hue+safe}, 100%, 80%)`;
            }
            this.read = this.color2;
        }
        ai() {
            var {target} = this;
            if(!target) {
                this.move(atan(this.vy, this.vx));
            }else{
                var rad = Entity.radian(this, target);
                var dis = Entity.distance(this, target);
                if(dis < 3) {
                    this.move(rad+PI);
                    if(dis < 1) {
                        this.ability(1, rad+PI);
                    }
                    this.skill(rad);
                }else if(dis > 4) {
                    this.move(rad);
                    if(dis > 6) {
                        this.ability(1, rad);
                    }
                }else{
                    this.skill(rad);
                }
            }

            delete this.target;
            delete this.clo;
        }
        aiRegister(enemy) {
            if(!(this.hits & enemy.team)) return;
            var bullet = enemy.team & TEAM.BULLET;
            var dis = Entity.rawDistance(this, enemy);

            var d = bullet? 3 * 3: 15 * 15;
            var a = dis < d && (!this.clo || dis < this.clo);
            if(!a || !this.sightCheck(enemy)) return;

            this.target = enemy;
            this.clo = dis;
        }
        draw(ctx) {
            var r = atan(this.vy, this.vx);
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
            if(!this.dead && this.hp) {
                if(this.lastShot) {
                    this.pen(ctx, {stroke: this.color2, scale: .5, r}, 0);
                }else{
                    this.pen(ctx, {fill: this.color2, stroke: this.color2, scale: .5, r}, 0);
                }
            }
        }
        hitWall(x, y)
        {
            if(x)
            {
                this.vx = abs(this.vx) * x * this.wb;
            }
            if(y)
            {
                this.vy = abs(this.vy) * y * this.wb;
            }
        }
        wb = 1;
        stats() {
            super.stats();
            if(this.lastShot) --this.lastShot;

            if(this.lastSkill > 30) {
                this.color2 = this.rech;
                this.r = this.lastSkill * .5;
                this.team = 0;
                this.hits = 0;
                this.coll = 0;
                this.wb = 0;
                this.alpha = .2;
            }else if(this.lastSkill) {
                this.alpha = 1;
                this.color2 = this.rech;
                this.team = TEAM.GOOD | TEAM.ALLY;
                this.hits = TEAM.BAD;
                this.coll = TEAM.ALLY | TEAM.ENEMY;
                this.wb = 1;
            }else{
                this.alpha = 1;
                this.color2 = this.read;
                this.team = TEAM.GOOD | TEAM.ALLY;
                this.hits = TEAM.BAD;
                this.coll = TEAM.ALLY | TEAM.ENEMY;
                this.wb = 1;
            }
        }
        ability(key, mrad, srad) {
            if(!this.lastSkill) {
                if(!isNaN(mrad)) {
                    this.move(mrad, 15);
                }
                this.lastSkill = 40;
            }
        }
        skill(rad) {
            if(!this.lastShot) {
                this.move(rad + PI, 5);
                var blob = new Bullet(this, rad);
                blob.team = TEAM.GOOD | TEAM.BULLET;
                blob.hits = TEAM.BAD;
                blob.coll = TEAM.ALLY | TEAM.ENEMY;
                blob.nocoll |= TEAM.GOOD;
                enemies.push(blob);
                this.lastShot = 15;
            }
        }
    };
    var Enemy = class Enemy extends Entity
    {
        constructor() {
            super();
            this.expert = game.expert;
        }
        spawn(tiles) {
            this.mod();
            super.spawn(tiles);
        }
        mod() {
            this.lives = mains.length-1;
            this.ml = mains.length;
        }
        color = "red";
        team = TEAM.ENEMY | TEAM.BAD;
        coll = TEAM.ENEMY | TEAM.ALLY;
        hits = TEAM.GOOD;
        b = 1;
    };
    var Bad = class Bad extends Enemy{
        attack(rad) {
            if(!this.lastSkill) {
                if(!isNaN(rad)) {
                    this.move(rad, 5);
                    this.lastSkill = 20;
                    this.slash = !this.slash;
                    var sword = new Sword(this, rad, 5, this.slash);
                    sword.atk /= 4;
                    // sword.nocoll = TEAM.BULLET | TEAM.BAD;
                    enemies.push(sword);
                }
            }
        }
        
        register(enemy) {
            if(!(this.hits & enemy.team) || enemy.team & TEAM.BULLET) return;
            var dis = Entity.rawDistance(this, enemy);
            var d = 7 * 7;
            var clo = this.clo;
            var a = dis < d && (!this.clo || dis < clo);
            if(!a) return;
            if(!this.sightCheck(enemy)) return;
            var {x, y, s} = enemy;
            this.target = {x, y, s};
            this.clo = dis;
        }

        tick() {
            var {target} = this;
            if(target) this.attack(Entity.radian(this, target));
            if(this.lastSkill) {
                --this.lastSkill;
                this.move(atan(this.vy, this.vx));
            }

            delete this.target;
            delete this.clo;
        }
    };
    var Chill = class Chill extends Enemy{
        color = "#afa";
        register(what) {
            if(this.expert && (what.team & this.hits) && (what.team & TEAM.BULLET)) {
                if(Entity.rawDistance(this, what) > 16) return;
                if(what.parent) {
                    this.target = what.parent;
                }
            }
        }
        draw(ctx) {
            var r = atan(this.vy, this.vx)
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
        }
        tick() {
            var {target} = this;
            if(this.expert && target) {
                var rad = Entity.radian(this, target);
                this.move(rad);
                if(target.dead) {
                    delete this.target;
                }
            }
        }
    };
    var Turret = class Turret extends Enemy{
        shape = 'square.4';
        shape2 = 'pointer';
        color = "#666";
        color2 = "#ff5";
        tick() {
            if(this.lastShot) {
                this.color2 = "#770";
                --this.lastShot;
            }else this.color2 = "#ff5";
            var {target} = this;
            if(!target) return;
            var rad = Entity.radian(this, target);
            var d = rDis(this.r, rad);
            var m = this.expert? 0.2: 0.1;
            if(abs(d) < m) this.r = rad;
            else this.r += m * sign(d);

            this.skill(this.r);

            delete this.target;
            delete this.clo;
        }
        skill(rad) {
            if(!this.lastShot) {
                // this.move(rad + PI, 5);
                var blob = new Ball(this, rad);
                blob.nocoll = TEAM.BAD;
                if(this.expert) blob.spd *= 0.7;
                // blob.lcoll.set(this, 200);
                // blob.spd = this.spd;
                // blob.f = this.f;
                // blob.draw = super.draw;
                blob.time /= 2;
                // blob.shape = this.shape;
                enemies.push(blob);
                this.lastShot = this.expert? 20: 30;
            }
        }
        constructor() {
            super();
            this.r = random(PI2);
        }
        m = 10;
        register(enemy) {
            if(!(this.hits & enemy.team) || enemy.team & TEAM.BULLET) return;
            var dis = Entity.rawDistance(this, enemy);
            var d = 7 * 7;
            var clo = this.clo;
            var a = dis < d && (!this.clo || dis < clo);
            if(!a) return;
            if(!this.sightCheck(enemy)) return;
            var {x, y, s} = enemy;
            this.target = {x, y, s};
            this.clo = dis;
        }
        draw(ctx) {
            var r = this.r;
            var o = PI*.5;
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
            this.pen(ctx, {shape: this.shape2, fill: this.color2, stroke: this.color2, r: r+o, scale: .5}, o);
        }
    }
    var Test = class Test extends Enemy
    {
        static lineCheck(sx, sy, ex, ey, tiles=mapTiles)
        {
            var dx = ex - sx;
            var dy = ey - sy;
            var d = dist(dx, dy);

            var ux = dx/d;
            var uy = dy/d;

            var see = false;
            
            var a = atan(ux, uy);

            var px = sx;
            var py = sy;
            var i = 0;
            while(i < d)
            {
                let x = floor(px);
                let y = floor(py);

                if(tiles[Index(x, y)] || outOfBounds(x, y)) {
                    var dis = dist(px - sx, py - sy) + 0.0001;
                    see = dis;
                    break;
                }

                if(ux > 0) wx = ceil(px);
                else var wx = floor(px);
                if(uy > 0) wy = ceil(py);
                else var wy = floor(py);

                var mx = abs(px - wx);
                var my = abs(py - wy);
                
                var tx = abs(mx/ux);
                var ty = abs(my/uy);

                if(tx < ty) {
                    m = tx;
                }else{
                    var m = ty;
                }
                m += 0.0001;

                px += ux * m;
                py += uy * m;
                i += m;
            }

            return see;
        }
    }
    var Mover = class Mover extends Enemy
    {
        constructor(r) {
            super();
            r = r ?? random(PI2);
            this.vx = cos(r) * this.spd;
            this.vy = sin(r) * this.spd;
        }
        tick()
        {
            if(this.expert && this.target) {
                var what = this.target;
                var dis = Entity.rawDistance(this, what);
                this.clo = dis;
                var rad = Entity.radian(this, what);
                this.move(rad);
                if(dis > 25 || what.dead || !this.sightCheck(what)) {
                    delete this.target;
                    this.clo = 100;
                }
            }else this.move(atan(this.vy, this.vx));
        }
        clo = 100;
        register(what) {
            if(!this.expert) return;
            var dis = Entity.rawDistance(this, what);
            if(this.isPlayer(what) && dis < 25 && dis < this.clo) {
                if(!this.sightCheck(what)) return;
                this.target = what;
                this.clo = dis;
            }
        }
        color = "#ff5";
        shape = "square.4";
        color2 = "#aa0";
        shape2 = "arrow.2";
        draw(ctx) {
            var r = atan(this.vy, this.vx) + PI*.5;
            super.draw(ctx);
            this.pen(ctx, {shape: this.shape2, fill: this.color2, stroke: this.color2, r}, PI*.5);
        }
    };
    var Stuck = class Stuck extends Enemy
    {
        constructor(r)
        {
            super();
            this.r = r ?? random(PI2);
        }
        color = "#5f5";
        shape = "square";
        hitWall(x, y)
        {
            var vx = cos(this.r);
            var vy = sin(this.r);
            if(x)
            {
                vx = abs(vx) * x;
            }
            if(y)
            {
                vy = abs(vy) * y;
            }
            this.r = atan(vy, vx);
        }
        tick()
        {
            this.move(this.r);
        }
    }
    var Bullet = class Bullet extends Stuck{
        constructor(parent, r) {
            super(r);
            this.parent = parent;
            this.color = parent.color;
            this.team = parent.team | TEAM.BULLET;
            this.hits = parent.hits;
            this.coll = parent.coll;
            this.nocoll = TEAM.BULLET;
            Bullet.position(this, r, parent);
            this.ox = this.x;
            this.oy = this.y;
        }
        points = [];
        proj = 1;
        tick() {
            super.tick();
            if(this.time) --this.time;
            else this.remove = true;
        }
        hitWall(a, b) {
            // var {x, y} = this;
            // this.points.push({x, y});
            // super.hitWall(a, b);
            this.remove = true;
        }
        onHit(atk, who) {
            super.onHit(who)
            this.remove = true;
            var {x, y} = this;
            this.points.push({x, y});
        }
        onCollide() {
            if(this.remove) return;
            var {sx: x, sy: y} = this;
            this.points.push({x, y});
        }
        step() {
            this.points = [];
            super.step();
        }
        draw() {
            game.scale();
            var s = this.s*.5;
            ctx.lineWidth = s;
            ctx.strokeStyle = this.color;
            if(this.old?.length) {
                ctx.globalAlpha = 0.1;
                ctx.beginPath();
                let f = 1;
                for(let {x, y} of this.old) {
                    if(f) {
                        f = 0;
                        ctx.moveTo(x+s, y+s);
                    }else ctx.lineTo(x+s, y+s);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            ctx.beginPath();
            ctx.moveTo(this.ox+s, this.oy+s);
            for(let {x, y} of this.points) {
                ctx.lineTo(x+s, y+s);
            }
            ctx.lineTo(this.x+s, this.y+s);
            this.old = [{x: this.ox, y: this.oy}, ...this.points, {x: this.x, y: this.y}];
            ctx.stroke();
            ctx.resetTransform();
        }
        time = 8;
        spd = 1;
        f = 0.01;
        static position(what, rad, parent, off=0) {
            if(!parent) parent = what.parent;
            var s = what.s * .5;
            var ps = parent.s;
            what.r = rad;
            var c = cos(rad), s = sin(rad);

            c *= off;
            s *= off;

            what.lcoll.set(parent, 30);

            what.ox = parent.x + ps/2 - what.s/2 + ps;
            what.oy = parent.y + ps/2 - what.s/2 + ps;

            what.x = parent.x + ps/2 - what.s/2 + c * ps;
            what.y = parent.y + ps/2 - what.s/2 + s * ps;
        }
        s = 0.2;
        m = 0.1;
    };
    var Ball = class Ball extends Mover{
        constructor(parent, r) {
            super(r);
            this.parent = parent;
            this.color = parent.color;
            this.team = parent.team | TEAM.BULLET;
            this.hits = parent.hits;
            this.coll = parent.coll;
            this.expert = false;
            Ball.position(this, r, parent);
        }
        register() {}
        draw(ctx) {
            var r = atan(this.vy, this.vx)
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
        }
        onHit(atk, who) {
            super.onHit(who);
            this.remove = true;
        }
        hitWall(x, y) {
            this.time -= 10;
            super.hitWall(x, y);
        }
        tick() {
            super.tick();
            if(this.time > 0) --this.time;
            else this.remove = true;
        }
        static position(what, r, parent) {
            Bullet.position(what, r, parent);
            what.lcoll.set(parent, 200);
        }
        time = 60;
        s = 0.2;
        m = 0.1;
    }
    var Wall = class Wall extends Mover{
        constructor() {
            super();
            if(this.expert) this.spd *= 1.5;
        }
        tick(tiles=mapTiles) {
            var s = this.s * .5;
            var mx = this.x + s;
            var my = this.y + s;

            mx = floor(mx);
            my = floor(my);

            var res = [];
            for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
            {
                dx += mx;
                dy += my;
                if(outOfBounds(dx, dy)) res.push(1);
                else if(tiles[Index(dx, dy)]) res.push(1);
                else res.push(0);
            }
            var [t, b, l, r, tl, bl, tr, br] = res;

            this.arr = [
                t || tr || tl,
                b || br || bl,
                l || tl || bl,
                r || tr || br
            ];

            var options = new Set;
            var P = PI * .5;
            if(t || b) {
                if(l) {
                    options.add(0);
                }else if(r) {
                    options.add(PI);
                }else{
                    options.add(0);
                    options.add(PI);
                }
            }
            if((bl || br) && !b) {
                options.add(P);
            }
            if((tl || tr) && !t) {
                options.add(P * 3);
            }
            if(l || r) {
                if(t) {
                    options.add(P);
                }else if(b) {
                    options.add(P * 3);
                }else{
                    options.add(P);
                    options.add(P * 3);
                }
            }
            if((bl || tl) && !l) {
                options.add(PI);
            }
            if((tr || br) && !r) {
                options.add(0);
            }
            var rad = atan(this.vy, this.vx);
            var cho = -1;
            if(options.has(this.last)) {
                cho = this.last;
                --this.lastT;
                if(!this.lastT) {
                    delete this.last;
                    delete this.lastT;
                }
                this.move(cho);
            }else{
                delete this.last;
                delete this.lastT;
                // if(!isNaN(this.cho) && options.size > 1) {
                //     options.delete(loop(this.cho + PI, PI2));
                // }
                if(options.size > 1) {
                    var obj = {};
                    options.forEach(r => {
                        obj[r] = sqrt(PI - abs(rDis(rad, r)));
                    });
                    // console.log(rad, obj);
                    cho = weight(obj);
                    // if(options.size > 2) {
                        this.last = cho;
                        this.lastT = this.expert? 8: 30;
                    // }
                    this.move(cho);
                }else{
                    delete this.last;
                    if(options.size == 1) {
                        cho = randomOf(options);
                        this.move(cho);
                    }else if(this.arr) {
                        var {arr} = this;
                        options.clear();
                        if(arr[0]) options.add(P*3);
                        if(arr[1]) options.add(P);
                        if(arr[2]) options.add(PI);
                        if(arr[3]) options.add(0);
                        cho = randomOf(options);
                        if(cho) {
                            this.move(cho);
                            this.last = cho;
                            this.arr = arr;
                        }else this.move(rad);
                    }else{
                        this.move(rad);
                    }
                }
            }
            this.cho = cho;
            var a = false;
            var b = false;
            for(let cho of options) {
                if(cho == PI || cho == 0) {
                    a = true;
                }
                if(cho == P || cho == P * 3) {
                    b = true;
                }
            }
            if(!(a && b)) {
                if(a) {
                    let y = floor(this.y) + (1 - this.s)*.5;
                    this.vy += (y - this.y);
                    this.vy *= 0.2;
                }
                if(b) {
                    let x = floor(this.x) + (1 - this.s)*.5;
                    this.xy += (x - this.x);
                    this.vx *= 0.2;
                }
            }
        }
        onCollide() {
            delete this.last;
            delete this.cho;
        }
        color = "#f5f";
        color2 = "#b0b";
    }
    var Wall_Fix = class extends Enemy{
        team = 0;
        hits = 0;
        wallInv = -1;
        shape = "square-horns";
        coll = TEAM.GOOD | TEAM.BAD | TEAM.DEAD;
        m = 20;
        constructor(target) {
            super();
            this.target = target;
        }
        spawn() {
            if(random() < .5) {
                this.x = random(game.w + 1, -1);
                this.y = round(random()) * (game.h + 2) - 1;
            }else{
                this.y = random(game.h + 1, -1);
                this.x = round(random()) * (game.w + 2) - 1;
            }
        }
        screenlock()
        {
            var w = game.w + 1 - this.s;
            var h = game.h + 1 - this.s;
            var s = 1;
            var d = [0, 0];
            if(this.x < -s)
            {
                d[0] = 1;
                this.x = -s;
            }
            if(this.y < -s)
            {
                d[1] = 1;
                this.y = -s;
            }
            if(this.x > w)
            {
                d[0] = -1;
                this.x = w;
            }
            if(this.y > h)
            {
                d[1] = -1;
                this.y = h;
            }
            if(d[0] || d[1]) this.hitWall(...d);
        }
        hitWall() {
            if(!this.target) {
                this.remove = true;
            }
        }
        tick() {
            var {target} = this;
            if(target) {
                var rad = Entity.radian(this, target);
                this.move(rad);
                if(target.wallInv < 1) {
                    delete this.target;
                }
            }else{
                var x = this.x;
                var y = this.y;
                var bx = game.w - this.x;
                var by = game.h - this.y;
                var m = min(x, y, bx, by);
                switch(m) {
                    case x:
                        this.move(PI)
                    break;
                    case y:
                        this.move(PI*1.5)
                    break;
                    case bx:
                        this.move(0)
                    break;
                    case by:
                        this.move(PI*.5)
                    break;
                }
            }
        }
    }
    var Brain = class Brain extends Enemy{
        constructor() {
            super();
            this.brainPoints = [];
            this.rad = random(PI2);
        }
        calcs = 1/8;
        brainMove() {
            var lines = [];
            var max;
            var add = PI2*this.calcs;
            for(let a = 0; a < PI2; a += add) {
                var num = 0;
                for(let [rad, pow] of this.brainPoints) {
                    let n = pow < 0; //iaNegative?
                    num += abs(((cos(a - rad) + 1)/2) ** (n? 7: .5)) * pow;
                }
                if(isNaN(max) || num > max) {
                    max = num;
                }
                lines.push([a, num]);
            }
            var lin = lines.filter(([a, num]) => num == max);
            if(lin.length) var [rad] = randomOf(lin);
            else{
                // rad = random(PI2);
                // max = 0;
            }
            max = abs(max);
            // if(max < .1) max = .1;
            if(max > 1) max = 1;

            this.rad = rad;

            this.move(rad, max);

            this.crad = rad;
            this.cmax = max;
            this.lines = lines;
            this.brainPoints = [];
        }
        wander = .5;
        tick(tiles) {
            this.rad += (srand() - .5)/4;
            this.brainPoints.push([this.rad, this.wander]);
            var lx = this.x + this.s;
            var ly = this.y + this.s;

            var mx = this.x + this.s * .5;
            var my = this.y + this.s * .5;

            var d = 2;
            var p = 5;
            var o = PI * .25;
            var off = PI * .125;

            for(let i = 0; i < 8; i++) {
                var c = cos(o * i + off) * d;
                var s = sin(o * i + off) * d;
                var dis = Test.lineCheck(mx, my, mx + c, my + s, tiles);
                if(dis && dis < d) {
                    // ctx.scale(scale, scale);
                    // ctx.lineWidth = 0.1;
                    // ctx.strokeStyle = "white";
                    // ctx.beginPath();
                    // ctx.moveTo(mx, my);
                    // ctx.lineTo(mx + c * dis / d, my + s * dis / d);
                    // ctx.stroke();
                    // ctx.resetTransform();
                    var n = (dis - d)/-d;
                    n **= p;
                    this.brainPoints.push([o * i + off, -n * .5]);
                }
            }
            this.brainMove();
        }
        register(enemy) {
            var dis = Entity.rawDistance(this, enemy);
            var d = 10 * 10;
            if(dis < d) {
                d = 10;
                dis = dis ** .5;
                var n = (dis - d)/-d;
                var rad = Entity.radian(this, enemy);
                n **= 2;
                this.brainPoints.push([rad, n]);
            }
        }
        draw() {
            super.draw();
            // var mx = this.x + this.s * .5;
            // var my = this.y + this.s * .5;
            // // // All options
            // ctx.lineWidth = 2;
            // if(this.lines) for(let [rad, spd] of this.lines) {
            //     var dis = abs(spd);
            //     ctx.strokeStyle = spd > 0? "green": "red";
            //     ctx.beginPath();
            //     ctx.moveTo(mx * scale, my * scale);
            //     var x = mx + cos(rad) * dis;
            //     var y = my + sin(rad) * dis;
            //     ctx.lineTo(x * scale, y * scale);
            //     ctx.stroke();
            // }
            // // Brain lines
            // for(let [rad, spd] of this.brainPoints) {
            //     var dis = abs(spd) * 5;
            //     ctx.strokeStyle = spd > 0? "purple": "orange";
            //     ctx.beginPath();
            //     ctx.moveTo(mx * scale, my * scale);
            //     var x = mx + cos(rad) * dis;
            //     var y = my + sin(rad) * dis;
            //     ctx.lineTo(x * scale, y * scale);
            //     ctx.stroke();
            // }
        }
        color = "#ccc";
    }
    var Chaser = class Chaser extends Brain{
        wander = .5;
        shape = 'square.4';
        color = "#666";
        color2 = "#fa5";
        dist = 5;
        nocoll = TEAM.BAD;
        constructor() {
            super();
            if(this.expert) {
                this.spd *= 1.5;
            }
        }
        draw(ctx) {
            Turret.prototype.draw.call(this, ctx);
        }
        tick(tiles) {
            this.r = this.rad;
            var enemy = this.target;
            this.wander = .5;
            if(enemy) {
                if(!enemy.c) {
                    var dis = Entity.rawDistance(this, enemy);
                    this.clo = dis*dis;
                    var d = this.dist+5;
                    if(dis < d*d) {
                        dis = dis**.5;
                        var n = (dis - d)/-d;
                        var rad = Entity.radian(this, enemy);
                        n **= .5;
                        this.brainPoints.push([rad, n * 0.8]);
                        if(dis < this.s*1.5) {
                            enemy.c = 1;
                        }
                    }
                    this.wander = .1;
                }else{
                    this.wander = 1;
                }
                if(enemy.time < 49) {
                    this.clo = 15*15;
                }
                --enemy.time;
                if(!enemy.time || dis > d)
                {
                    delete this.target;
                    delete this.clo;
                }
            }
            super.tick(tiles);
        }
        register(enemy, sight=true) {
            // if((this.team & enemy.team) && !(enemy.team & TEAM.BULLET)) {
            //     var dis = Entity.rawDistance(this, enemy);
            //     var d = (enemy.s + this.s)*1.5;
            //     var a = dis < d*d;
            //     if(!a) return;
            //     // if(!this.sightCheck(enemy)) return;
            //     dis = dis**.5;
            //     if(dis < d) {
            //         var n = (dis - d)/-d;
            //         var rad = Entity.radian(this, enemy);
            //         n **= 2;
            //         this.brainPoints.push([rad, -n]);
            //     }
            // }
            if(!(this.hits & enemy.team) || enemy.team & TEAM.BULLET) return;
            var dis = Entity.rawDistance(this, enemy);
            var d = this.dist;
            var a = dis < d*d && (dis < this.clo || !this.clo);
            if(!a) return;

            if(sight && !this.sightCheck(enemy)) return;
            var {x, y, s} = enemy;
            this.target = {x, y, s, time: 50};
            this.clo = dis;
        }
    }
}
{
    var Ghost = class Ghost extends Enemy{
        constructor() {
            super();
            this.r = random(PI2);
        }
        color = 'white';
        shape2 = "arrow.2";
        color2 = "black";
        tick(tiles=mapTiles) {
            var s = this.s;
            var mx = this.x+s*.5;
            var my = this.y+s*.5;
            var tx = floor(mx);
            var ty = floor(my);
            if(this.tx != tx || this.ty != ty) {
                this.tx = tx;
                this.ty = ty;
                this.onTile(tiles);
            }
            if(this.goal) {
                var rad = Entity.radian(this, this.goal);
                this.move(rad);
            }
        }
        hitWall(...a) {
            super.hitWall(...a);
            delete this.tx;
            delete this.ty;
        }
        onCollide() {
            delete this.tx;
            delete this.ty;
            delete this.r;
        }
        onTile(tiles) {
            var res = [];
            for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
            {
                dx += this.tx;
                dy += this.ty;
                if(outOfBounds(dx, dy)) res.push(1);
                else if(tiles[Index(dx, dy)]) res.push(1);
                else res.push(0);
            }
            var [t, b, l, r, tl, bl, tr, br] = res;

            var options = [];
            var P = PI * .5;
            if(!r && this.r != PI) options.push(0);
            if(!t && this.r != P) options.push(P*3);
            if(!l && this.r != 0) options.push(PI);
            if(!b && this.r != P*3) options.push(P);

            if(options.includes(this.r)) {
                options.push(this.r);
                options.push(this.r);
            }

            if(options.length) {
                // if(!options.includes(this.r)) {
                    this.r = randomOf(options);
                // }

                this.goal = {
                    x: this.tx + cos(this.r),
                    y: this.ty + sin(this.r),
                    s: 1
                };
            }else{
                this.r = random(PI2);
                delete this.goal;
            }
        }
        draw() {
            var r = this.r+PI*.5;
            super.draw(ctx);
            this.pen(ctx, {shape: this.shape2, fill: this.color2, stroke: this.color2, r}, PI*.5);

            // var goal = this.goal;
            // if(!goal) return;
            // ctx.strokeStyle = this.color;
            // this.drawLine(ctx, this.tx, this.ty, goal.x, goal.y);
        }
        drawLine(ctx, x, y, a, b) {
            x += .5;
            y += .5;
            a += .5;
            b += .5;

            game.scale(ctx);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(a, b);
            ctx.stroke();
            ctx.resetTransform();
        }
    }
    var RedGhost = class RedGhost extends Ghost{
        onTile(tiles) {
            var res = [];
            for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
            {
                dx += this.tx;
                dy += this.ty;
                if(outOfBounds(dx, dy)) res.push(1);
                else if(tiles[Index(dx, dy)]) res.push(1);
                else res.push(0);
            }
            var [t, b, l, r, tl, bl, tr, br] = res;

            var options = [];
            var P = PI * .5;
            if(!r && this.r != PI) options.push(0);
            if(!t && this.r != P) options.push(P*3);
            if(!l && this.r != 0) options.push(PI);
            if(!b && this.r != P*3) options.push(P);

            // if(options.includes(this.r)) {
            //     options.push(this.r);
            //     options.push(this.r);
            // }

            if(options.length) {
                if(!this.target) {
                    if(!options.includes(this.r)) {
                        this.r = randomOf(options);
                    }
                    this.color = "blue";
                }else{
                    this.color = "orange";
                    var player = this.target;

                    var dists = options.map(R => {
                        var obj = {
                            x: this.tx + cos(R),
                            y: this.ty + sin(R),
                            s: 1
                        };
                        var dis = Entity.rawDistance(player, obj);
                        // game.ctx.strokeStyle = "blue";
                        // this.drawLine(game.ctx, this.tx, this.ty, obj.x, obj.y)
                        return dis;
                    });
                    var l = dists.length;
                    var p, n, c = 1000000;
                    for(let i = 0; i < l; i++) {
                        if((n = dists[i]) < c) {
                            p = options[i];
                            c = n;
                        }
                    }
                    this.r = p;
                }

                this.goal = {
                    x: this.tx + cos(this.r),
                    y: this.ty + sin(this.r),
                    s: 1
                };
            }else{
                this.r = random(PI2);
                delete this.goal;
            }
        }
        tick(tiles) {
            super.tick(tiles);
            delete this.target;
            this.clo = 10000;
        }
        clo = 10000;
        register(what) {
            var dis = Entity.rawDistance(this, what);
            if(this.isPlayer(what) && dis < this.clo) {
                this.target = what;
                this.clo = dis;
            }
        }
        color = "red";
    }
}
{
    var SurvivalGame = class extends Entity{
        onSpawned() {
            for(let blob of mains) {
                blob.s = 0.3;
                blob.spd *= 0.75;
            }
        }
        time = 0;
        tick() {
            if(!this.spawned) return;
            if(this.time % 100 == 0) {
                this.summon(randomOf([Boss, TurretBoss, Chaser]));
            }
            ++this.time;
        }
        summon(cla) {
            var blob = new cla();
            blob.spawned = 1;
            blob.s = 0.3;
            blob.spd *= .75;
            blob.hp = 1;
            blob.xhp = 1;
            blob.x = 0;
            blob.y = 0;
            enemies.push(blob);
        }
    }
    var Boss = class Boss extends Mover{
        nocoll = TEAM.BAD;
        hp = 10;
        xhp = 10;
        s = 0.8;
        m = 0.2;
        f = 0.7;
        constructor(r) {
            super(r);
            this.spd *= 1.4;
        }
        onSpawned() {
            bosses.add(this);
        }
        time = 0;
        phase = 2;
        step(m) {
            super.step(m);
            delete this.player;
            delete this.clo2;
        }
        register(what) {
            if(this.expert) super.register(what);
            if(this.isPlayer(what)) {
                var dis = Entity.rawDistance(this, what)
                if(!this.clo2 || dis < this.clo2) {
                    this.player = what;
                    this.clo2 = dis;
                }
            }
        }
        onHit(atk, who) {
            super.onHit(atk, who);
            if(!this.expert) {
                this.time = 0;
            }
            if(this.phase == 0) {
                ++this.phase;
                this.time = 0;
                this.color = "#f95";
                this.color2 = "#a60";
            }
            else if(this.phase == 1) {
                this.phase = 2;
                this.color = "#ff5";
                this.color2 = "#aa0";
            }
            else if(this.phase == 2) {
                this.phase = 0;
                this.color = "#d00";
                this.color2 = "#800";
            }
        }
        tick() {
            var {player: target, expert} = this;
            switch(this.phase) {
                case 0:if(target) {
                    var rad = Entity.radian(this, target);
                    this.move(rad, expert? 2: 1);
                    if(this.expert && ++this.time % 30 == 0) {
                        this.summon(Wall);
                    }
                }break;
                case 1:
                    ++this.time;
                    if(expert) {
                        if(this.time % 20 == 0) {
                            this.summon(Mover);
                        }
                        if(this.time >= 80) {
                            ++this.phase;
                            this.time = 0;
                            this.color = "#ff5";
                            this.color2 = "#aa0";
                        }
                    }else{
                        if(this.time >= 30) {
                            for(let i = 0; i < 4; i++) {
                                this.summon(Mover);
                            }
                            ++this.phase;
                            this.time = 0;
                            this.color = "#ff5";
                            this.color2 = "#aa0";
                        }
                    }
                break;
                case 2:
                    super.tick();
                    if(this.expert && ++this.time % 40 == 0) {
                        this.summon(Chill);
                    }
                break;
            }
        }
        drawBossIcon(ctx, x, y, s) {
            this.drawWith(ctx, {x, y, s, alpha: 1, zoom: 0, vx: 0, vy: 0, hp: this.xhp});
        }
        summon(cla) {
            // if(!this.spawned) return;
            var blob = new cla();
            blob.color = this.color;
            blob.color2 = this.color2;
            Bullet.position(blob, 0, this);
            blob.nocoll = TEAM.BAD;
            enemies.push(blob);
        }
    };
    var TurretBoss = class extends Chaser{
        hp = 10;
        xhp = 10;
        s = 0.8;
        m = 0.2;
        color = "#666";
        color2 = "#55f";
        time = 0;
        phase = 0;
        dist = 20;
        calcs = 1/16;
        r = 0;
        constructor() {
            super();
            if(this.expert) {
                this.spd /= 1.5;
            }
        }
        drawBossIcon(ctx, x, y, s) {
            var obj = {x, y, s, alpha: 1, zoom: 0, vx: 0, vy: 0, hp: this.xhp, r: 0};
            obj = {...this, ...obj};
            obj.pen = this.pen;
            super.draw.call(obj, ctx);
        }
        onSpawned() {
            bosses.add(this);
        }
        step(m) {
            super.step(m);
            delete this.player;
            delete this.clo2;
        }
        register(what) {
            super.register(what);
            if(this.isPlayer(what)) {
                var dis = Entity.rawDistance(this, what);
                if(!this.clo2 || dis < this.clo2) {
                    this.player = what;
                    this.clo2 = dis;
                }
            }
        }
        draw(ctx) {
            super.draw(ctx);
            var {teleport} = this;
            if(teleport) {
                var {x, y, color} = this;
                this.color = "red";
                this.alpha = .5;
                this.x = teleport.x;
                this.y = teleport.y;
                super.draw(ctx);
                this.x = x;
                this.y = y;
                this.color = color;
                delete this.alpha;
            }
        }
        tick(tiles) {
            var {target, player, teleport, expert} = this;
            this.color2 = "#55f";
            switch(this.phase) {
                case 0:if(player) {
                    let {x, y} = player;
                    let s = (player.s - this.s)*.5;
                    x += s; y += s;
                    this.teleport = {x, y};
                    this.phase = 1;
                    this.time = 0;
                }break;
                case 1:if(++this.time == (expert? 20: 50)) {
                    this.x = teleport.x;
                    this.y = teleport.y;
                    this.wallInv = 1;
                    delete this.teleport;
                    // delete this.target;
                    this.phase = 2;
                    this.time = 0;
                }break;
                case 2:
                    if(player && ++this.time <= (expert? 40: 30) && this.time % 5 == 0) {
                        let rad = Entity.radian(this, player);
                        let blob = new Ball(this, rad);
                        blob.time = expert? 130: 200;
                        blob.move(rad, 25);
                        blob.hitref = this;
                        blob.nocoll = TEAM.BAD;
                        enemies.push(blob);
                    }
                    if(this.time > 125) {
                        this.color2 = "red";
                    }
                    super.tick(tiles);
                    if(this.time == 150) {
                        if(this.sightCheck(player)) this.time = 0;
                        else this.phase = 0;
                    }
                break;

            }
        }
    }
}
{//levels.js
    var startLevel = function startLevel() {
        var world = worlds[selectedWorld];
        var obj = world?.levels[level];
        if(!obj) return;
        ++level;
        loadLevel(obj, world);
    }
    function loadLevel(obj, world, _players=[]) {
        loader.delay = 51;
        loader.time  = 51;
        loader.color = world.color;
        loader.color2 = world.color2;
        loader.dir = 0;
        loader.expert = expert;
        let NoDelete = blob => {
            let obj = {};
            for(let prop of [
                "hp",
                "dead",
                "team",
                "coll",
                "hits",
                "nocoll"
            ]) {
                obj[prop] = blob[prop];
            }
            return function() {
                Object.assign(this, obj);
            }
        };
        var {spawn=[], tiles="", seed} = obj;
        if(seed) lehmer.seed = seed;
        var layout = Binary(tiles);
        for(let x = 0; x < game.w; x++) for(let y = 0; y < game.h; y++)
        {
            let i = Index(x, y);
            let a = layout[i];
            loader.tiles[i] = isNaN(a)? 0: Number(a);
        }
        var len = spawn.length;
        for(let i = 0; i < len; i++) {
            let cla = spawn[i];
            if(!cla.prototype) continue;
            let num = spawn[i-1];
            if(typeof num != "number" || isNaN(num)) {
                num = 1;
            }
            for(let a = 0; a < num; a++) {
                var blob = new cla();
                blob.nospawn = (tiles=mapTiles) => {
                    for(let them of loader.enemies) {
                        if((Entity.hitTest(blob, them) || Entity.collTest(blob, them)) && Entity.isTouching(blob, them)) {
                            return true;
                        }
                    }
                    return blob.inWall(0, tiles);
                }
                if(worldSelect.active) {
                    blob.delete = NoDelete(blob);
                }
                blob.spawn(loader.tiles);
                loader.enemies.push(blob);
            }
        }
        let i = 0;
        for(let cla of _players) {
            var blob = new cla(i++);
            // if(worldSelect.active) {
                blob.nospawn = (tiles=mapTiles) => {
                    for(let them of loader.enemies) {
                        if((Entity.hitTest(blob, them) || Entity.collTest(blob, them)) && Entity.isTouching(blob, them)) {
                            return true;
                        }
                    }
                    return blob.inWall(0, tiles);
                }
                blob.spawn = Enemy.prototype.spawn;
                blob.mod = () => {};
                blob.delete = NoDelete(blob);
            // }
            blob.spawn(loader.tiles);
            loader.enemies.push(blob);
        }
    }
    {
        let canv = document.createElement("canvas");
        let ctx1 = canv.getContext("2d");
        let canv2 = document.createElement("canvas");
        let ctx2 = canv2.getContext("2d");
        let n = 64;
        canv.width = n;
        canv.height = n;
        canv2.width = n;
        canv2.height = n;
        let draw = () => {
            var {width: w, height: h} = canv;
            var ctx = ctx1; //bottom
            ctx.fillStyle = "#111";
            ctx.strokeStyle = "#aaa";
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
            // ctx.scale(w, h);

            var ctx = ctx2; //top
            ctx.fillStyle = "#999";
            ctx.strokeStyle = "#555";
            ctx.fillRect(0, 0, w, h);
            ctx.strokeRect(0, 0, w, h);
        };
        draw();
        var test = {
            world: {
                tiles: "01000001fbf0140fabe0501fbf00000100",
                spawn: [5, Ghost, 5, RedGhost]
            },
            levels: [{
                tiles: "01000001fbf0140fabe0501fbf00000100",
                spawn: [10, RedGhost],
                name: "Ghosts"
            }, {
                spawn: [10, Bad],
                name: "Swords"
            }],
            name: "Test",
            color2: (w, h, z) => {
                let col = ctx.createPattern(canv, "repeat");
                col.setTransform(zoomMatrix(0, 0, 1/n, 1/n));
                return col;
            },
            color: (w, h, z) => {
                let col = ctx.createPattern(canv2, "repeat");
                col.setTransform(zoomMatrix(0, 0, 1/n, 1/n));
                return col;
            }
        };
    }
    {//old
        var world1 = {
            world: {
                tiles: "01000201c47008000000201c4700800100",
                spawn: [5, Wall, 5, Mover]
            },
            levels: [{
                spawn: [10, Chill],
            }, {
                spawn: [10, Mover],
                tiles: "0000000060c00000380000060c00000000"
            }, {
                tiles: "0000202040408080380202040408080000",
                spawn: [10, Wall]
            }, {
                tiles: "01000201c47008000000201c4700800100",
                spawn: [5, Wall, 5, Mover]
            }, {
                tiles: "0000202040400000100000040408080000",
                spawn: [Boss],
                name: "Captain Motion"
            }],
            name: "World 1",
            color2: (w, h) => {
                let x = w * .5;
                let y = h * .5;
                let r = max(w,h);
                // let col = ctx.createLinearGradient(0, h, w, 0);
                let col = ctx.createRadialGradient(x, y, 1, x, y, r);
                col.addColorStop(0, "#3c3c3c");
                col.addColorStop(.5, "#393939");
                col.addColorStop(1, "#303030");
                return col;
            },
            color: (w, h) => {
                let col = ctx.createLinearGradient(0, 0, w, h);
                col.addColorStop(0, "#bbb");
                col.addColorStop(.5, "#fff");
                col.addColorStop(1, "#aaa");
                return col;
            }
        };
    }
    {
        let canv = document.createElement("canvas");
        let ctx1 = canv.getContext("2d");
        let canv2 = document.createElement("canvas");
        let ctx2 = canv2.getContext("2d");
        let n = 64;
        canv.width = n;
        canv.height = n;
        canv2.width = n;
        canv2.height = n;
        let draw = () => {
            var {width: w, height: h} = canv;
            var ctx = ctx1;
            ctx.fillStyle = "#111";
            ctx.scale(w, h);
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#600";
            ctx.fillRect(.1, .1, .1, .1);
            ctx.fillRect(0, .5, .1, .1);
            ctx.fillStyle = "#006";
            ctx.fillRect(.6, .7, .1, .1);
            ctx.fillRect(0, 0, .1, .1);
            ctx.fillStyle = "#050";
            ctx.fillRect(.2, .8, .1, .1);
            ctx.fillRect(.6, .2, .1, .1);
            ctx.fillStyle = "#660";
            ctx.fillRect(.3, .5, .1, .1);
            ctx.fillStyle = "#066";
            ctx.fillRect(.6, .9, .1, .1);
            ctx.fillRect(.8, .3, .1, .1);
            ctx.fillStyle = "#505";
            ctx.fillRect(.8, .8, .1, .1);

            var ctx = ctx2;
            ctx.fillStyle = "#999";
            ctx.scale(w, h);
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#a00";
            ctx.fillRect(.2, .2, .1, .1);
            ctx.fillRect(.9, .4, .1, .1);
            ctx.fillStyle = "#00a";
            ctx.fillRect(.5, .9, .1, .1);
            ctx.fillRect(.7, .2, .1, .1);
            ctx.fillStyle = "#0a0";
            ctx.fillRect(0, .7, .1, .1);
            ctx.fillRect(.4, .1, .1, .1);
            ctx.fillStyle = "#aa0";
            ctx.fillRect(.3, .5, .1, .1);
            ctx.fillStyle = "#0aa";
            ctx.fillRect(.9, 0, .1, .1);
            ctx.fillStyle = "#a0a";
            ctx.fillRect(.7, .7, .1, .1);
            ctx.fillRect(.6, .1, .1, .1);
        };
        draw();
        var world2 = {
            world: {
                tiles: "01000001fbf0140fabe0501fbf00000100",
                spawn: [5, Turret, 5, Chaser]
            },
            name: "World 2",
            levels: [{
                spawn: [10, Turret],
                tiles: "1110202000008089012202000008081110"
            }, {
                tiles: "00002521fbf080810102021fbf09480000",
                spawn: [10, Turret]
            }, {
                tiles: "00000000f1f022004400880f1f00000000",
                spawn: [5, Turret, 5, Chaser]
            }, {
                tiles: "01000001fbf0140fabe0501fbf00000100",
                spawn: [10, Turret, 10, Chaser]
            }, {
                tiles: "0000020004000007c7c000004000800000",
                spawn: [TurretBoss],
                name: "Ball Master"
            }],
            color2: (w, h, z) => {
                let col = ctx.createPattern(canv, "repeat");
                col.setTransform(zoomMatrix(0, 0, 1/n, 1/n));
                return col;
            },
            color: (w, h, z) => {
                let col = ctx.createPattern(canv2, "repeat");
                col.setTransform(zoomMatrix(0, 0, 1/n, 1/n));
                return col;
            }
        }
    }
    function func(a) {return () => a};
    var minigames = {
        world: {},
        levels: [{
            spawn: [SurvivalGame],
            tiles: "10702040088610000000400d8800100071"
        }],
        name: "Minigames",
        color2: func("#111"),
        color: func("#ccc")
    };
    let pads = [];
    let PadTracker = class PadTracker{
        constructor(id) {
            this.id = id;
        }
        button = new Map;
        update() {
            var pads = navigator.getGamepads?.();
            var pad = pads?.[gamepads[this.id]];
            if(!pad) return;

            for(let i in pad.buttons) {
                let button = pad.buttons[i];
                if(button.value) {
                    if(this.button.has(i)) {
                        this.button.set(i, 3);
                    }else{
                        this.button.set(i, 1);
                    }
                }else if(this.button.has(i)) {
                    this.button.delete(i);
                    // console.log(i);
                }
            }
        }
        use(button) {
            button = button+"";
            if(this.button.get(button) == 1) {
                return this.button.set(button, 2);
            }
        }
    };
    let worlds = [world1, world2, test];
    let selectedWorld = 0;
    let loadedWorld = -1;
    let selectedLevel = 0;
    let loadedLevel = -1;
    let _players = [0];
    let Class = [Gunner, Guy];
    let Players = () => _players.map(id => Class[id]);
    let dir;
    let mnu = 0;
    var button = new Button;
    var worldSelect = function worldSelect() {
        mains = [0];
        if(mnu == 1) {
            var lworld = loadedLevel;
            var sworld = selectedLevel;
            var wrlds = worlds[selectedWorld].levels;
            var sWorld = worlds[selectedWorld];
        }else{
            wrlds = worlds;
            sworld = selectedWorld;
            lworld = loadedWorld;
        }
        if(lworld != sworld) {
            loader.enemies = [];
            let wrld = wrlds[sworld];
            if(mnu) loadLevel(wrld, sWorld, Players());
            else loadLevel(wrld.world, wrld);
            if(lworld == -1) {
                game.color = wrld.color;
                game.color2 = wrld.color2;
                loader.load();
            }else{
                loader.dir = dir;
                loader.time = 15;
                loader.delay = 15;
            }
            if(mnu) loadedLevel = sworld;
            else loadedWorld = sworld;
        }
        var wrld = sWorld || wrlds[sworld];
        game.stepM = 0.5;
        world();
        ctx.resetTransform();
        
        var h = game.height/10;
        ctx.font = `${h/2}px Josefin Sans`;
        var label = wrld.name;
        var c1 = wrld.color(game.width, game.height, 1);
        var c2 = wrld.color2(game.width, game.height, 1);
        var wid = ctx.measureText(label).width;
        {
            let w = wid * 1.5;
            let w2 = wid * 1.8;
            ctx.beginPath();
            let x1 = (game.width-w2)*.5;
            let x2 = (game.width-w)*.5;
            let y = h * 1.6;
            ctx.lineWidth = h/10;
            ctx.moveTo(x1, 0);
            ctx.lineTo(x2, y);
            ctx.lineTo(x2+w, y);
            ctx.lineTo(x1+w2, 0);
            ctx.closePath();
            ctx.strokeStyle = c1;
            ctx.fillStyle = c2;
            ctx.fill();
            ctx.stroke();
            if(mnu) {
                button.resize(x1, 0, w2, y);
                button.draw();
                if(buttonClick(button)) {
                    var UP = 1;
                }
            }
        }
        ctx.fillStyle = c1;
        ctx.fillText(label, (game.width-wid)*.5, h * 1);
        if(mnu) {
            var label = wrlds[sworld].name || "Level "+(sworld+1);
            var wid = ctx.measureText(label).width;
            {
                let w = wid * 1.5;
                let w2 = w * 1.2;
                ctx.beginPath();
                let x1 = (game.width-w2)*.5;
                let x2 = (game.width-w)*.5;
                let b = game.height;
                let y = b - h * 1.6;
                ctx.lineWidth = h/10;
                ctx.moveTo(x1, b);
                ctx.lineTo(x2, y);
                ctx.lineTo(x2+w, y);
                ctx.lineTo(x1+w2, b);
                ctx.closePath();
                ctx.strokeStyle = c1;
                ctx.fillStyle = c2;
                ctx.fill();
                ctx.stroke();
                {
                    button.resize(x1, y, w2, b-y);
                    button.draw();
                    if(buttonClick(button)) {
                        var DOWN = 1;
                    }
                }
            }
            ctx.fillStyle = c1;
            ctx.fillText(label, (game.width-wid)*.5, h * 9.4);
        }

        while(pads.length < gamepads.length) {
            pads.push(new PadTracker(pads.length));
        }

        let j = 0;
        var A_button = false;
        var B_button = false;
        var Left = false;
        var Right = false;
        for(let pad of pads) {
            pad.update();
            if(pad.use(0)) {
                A_button = true;
            }
            if(pad.use(1)) {
                B_button = true;
            }
            let i = j;
            if(pad.use(12)) {
                if(mnu) loadedLevel = -1;
                ++_players[i];
                _players[i] %= Class.length;
            }
            if(pad.use(13)) {
                if(mnu) loadedLevel = -1;
                _players[i] += Class.length - 1;
                _players[i] %= Class.length;
            }
            if(pad.use(14)) {
                Left = true;
            }
            if(pad.use(15)) {
                Right = true;
            }
            ++j;
        };
        {
            let wid = (game._x-1)*scale;
            let x = wid * 0;
            let h = wid * 1;
            let y = (innerHeight-h)*.5;
            button.resize(x, y, h, h);
            button.draw();
            let PAD = h * 0.1;
            {
                ctx.zoom(x+PAD, y+PAD, h-PAD-PAD, h-PAD-PAD, PI);
                let shp = shape("arrow");
                ctx.fill(shp);
                ctx.resetTransform();
            }
            Left ||= buttonClick(button);
            x = innerWidth - h;
            button.resize(x, y, h, h);
            button.draw();
            {
                ctx.zoom(x+PAD, y+PAD, h-PAD-PAD, h-PAD-PAD);
                let shp = shape("arrow");
                ctx.fill(shp);
                ctx.resetTransform();
            }
            Right ||= buttonClick(button, 0, 1);
            x = wid;
            y = (game._y-1)*scale;
            let w = (game.w+2)*scale;
            h = (game.h+2)*scale;
            button.resize(x, y, w, h);
            button.draw();
            let a = buttonClick(button, 0, 1);
            if(a) canvas.requestFullscreen();
            A_button ||= a;
            button.resize(0, 0, game.width, game.height);
            B_button ||= buttonClick(button, 0, 1);
        }
        if(keys.use("ArrowRight") || Right) {
            if(mnu) selectedLevel = loop(sworld+1, wrlds.length);
            else{
                selectedWorld = loop(sworld + 1, wrlds.length);
                selectedLevel = 0;
            }
            dir = 1;
            if(loader.delay) loader.load();
        }
        if(keys.use("ArrowLeft") || Left) {
            if(mnu) selectedLevel = loop(sworld-1, wrlds.length);
            else{
                selectedWorld = loop(sworld - 1, wrlds.length);
                selectedLevel = 0;
            }
            dir = -1;
            if(loader.delay) loader.load();
        }
        while(_players.length < multi+1) {
            _players.push(0);
            if(mnu) loadedLevel = -1;
        }
        if(_players.length > multi+1) {
            _players.length = multi+1
            if(mnu) loadedLevel = -1;
        }
        if(keys.use("ArrowUp") || UP) {
            if(mnu) loadedLevel = -1;
            let i = multi;
            ++_players[i];
            _players[i] %= Class.length;
        }
        if(keys.use("ArrowDown") || DOWN) {
            if(mnu) loadedLevel = -1;
            let i = multi;
            _players[i] += Class.length - 1;
            _players[i] %= Class.length;
        }
        if(keys.use("Backspace") || B_button) {
            if(mnu) {
                loadedLevel = -1;
                mnu = 0;
                if(loader.delay) loader.load();
            }
        }
        if(keys.use("Space") || A_button) {
            if(mnu == 0) {
                mnu = 1;
                loadedWorld = -1;
                if(loader.delay) loader.load();
            }else{
                mnu = 0;
                loadedWorld = -1;
                loadedLevel = -1;

                loader.load();
                worldSelect.active = false;
                worldSelect.spawn();
                level = selectedLevel;
                game.stepM = 1;
            }
        }
        if(keys.use("Escape")) {
            mainMenu.active = true;
        }
    };
    worldSelect.spawn = function() {
        enemies = [];
        mains = [];
        for(let i = 0; i <= multi; i++) {
            mains.push(new Class[_players[i]](i).spawn());
        }
        enemies = mains;
    };
    worldSelect.active = true;
};

onload = () =>
{
    onresize();
    document.body.appendChild(canvas);
    // document.body.appendChild(sprites.sheet);
    init();
};
