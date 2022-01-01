"use strict";
const gameVersion = "0.0.7";
const RUN_KEY = Symbol();

var bullets = [];
var enemies = [];

var lockToEdges = false;
var cameraState = "";
var zoomLevel = 2;
var panSpeed = 0.2;
var zoomSpeed = 0.1;
var level = 1;
var player;
var creator = window.creator;
var edit;
var DEAD = 10;

{
    let canv = document.createElement("canvas");
    let octx = canv.getContext("2d");
    var loader = {
        load() {
            mapTiles = this.tiles;
            if(worldSelect.active) enemies = [];
            for(let enemy of enemies) {
                if(enemy.inWall() && !enemy.wallInv) {
                    enemy.wallInv = 1;
                }
            }
            this.delay = 0;
            var arr = [];
            if(worldSelect.active) enemies = this.enemies;
            else for(let blob of this.enemies) {
                var hit = false;
                for(let them of enemies) {
                    if((Entity.hitTest(blob, them) || Entity.collTest(blob, them)) && Entity.isTouching(blob, them)) {
                        hit = true;
                        break;
                    }
                }
                if(hit) arr.push(blob);
                else enemies.push(blob);
            }
            if(arr.length) {
                this.enemies = arr;
                this.delay = 1;
            }else{
                game.color = this.color;
                game.color2 = this.color2;
                this.tiles = [];
                this.enemies = [];
                this.dir = 0;
            }
        },
        canvas: canv,
        ctx: octx,
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
    function Slider({min, max, inc}, script, loader) {
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
        }, () => +load("cam.focus") || 0.1)
    );
    var setCam = i => camOpt.set(i);
    var modZoom = i => zoomOpt.use(i);
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
        if(keys.hold("Escape")) {
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
    var random = (max=1, min=0) => Math.random() * (max - min) + min;
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
    lehmer.seed = 9;

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
                    // var player = enemies[0];
                    s = player.s * .5;
                    game.x += game.zw * .5 - player.x - s;
                    game.y += game.zh * .5 - player.y - s;
                }
                if(cameraState == "mouse") {
                    let s = 1/scale;
                    game.x = (game.zw - (innerWidth * s)) * -.5;
                    game.y = (game.zh - (innerHeight * s)) * -.5;

                    // var player = enemies[0];
                    s = player.s * .5;
                    game.x += game.zw * .5 - player.x - s;
                    game.y += game.zh * .5 - player.y - s;

                    let {x, y} = mouse;
                    x -= innerWidth/2;
                    y -= innerHeight/2;
                    x = x/scale;
                    y = y/scale;
                    game.x -= x;
                    game.y -= y;
                }
                if(cameraState == "auto") {
                    let arr = [...enemies, ...loader.enemies].filter(blob => !(blob.dead ||blob.remove || (blob.team & TEAM.BULLET)));
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
    /**@type {zoom}*/
    var ctxZoom = zoom.bind(ctx);
    onresize = () =>
    {
        // game.length = min(innerHeight, innerWidth);
        game.width = innerWidth;
        game.height = innerHeight;
        canvas.height = game.height;
        canvas.width = game.width;
        loader.canvas.height = game.height;
        loader.canvas.width = game.width;

        rescale();

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
    oncontextmenu = (e) => (mouse.d = 2, onmousemove(e), e.preventDefault());
    onmousedown = (e) => (mouse.d = 1, onmousemove(e));
    onmouseup = (e) => (mouse.d = 0, onmousemove(e));
    onmousemove = ({pageX: x, pageY: y}) => (mouse.x = x, mouse.y = y);
    // ontouchstart = (e) => [...e.changedTouches].forEach(touch => onmousedown(touch));
    // ontouchmove = (e) => [...e.changedTouches].forEach(touch => onmousemove(touch));
    // ontouchend = (e) => [...e.changedTouches].forEach(touch => onmouseup(touch));
}
//keys.js
{
    var keys = new (class Keys extends Map
    {
        hold(code)
        {
            return this.get(code) & 1
                && this.set(code, 2);
        }
        use(code)
        {
            return this.get(code) == 1
                && this.set(code, 2);
        }
        press(code)
        {
            this.has(code)?
                this.set(code, 3):
                this.set(code, 1);
        }
    });
    onkeydown = ({code}) => keys.press(code);
    onkeyup  = ({code}) => keys.delete(code);
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
    var nextFrame = () => RUN_KEY == window.run_key && setTimeout(main, 1000/40);
    var player;
    var lastI = -1;
    function main()
    {
        try{
        if(mainMenu.active) mainMenu();
        else if(worldSelect.active) worldSelect();
        else world();
        nextFrame();
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
                            if(!enemies.includes(player)) {
                                enemies.push(player);
                                player.remove = false;
                            }
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
            if(keys.use("Backspace")) {
                worldSelect.active = true;
            }
            if(keys.use("Space")) {
                if(player.remove) {
                    --level;
                    mapTiles = [];
                    player.remove = false;
                    player.dead = 0;
                    player.hp = 1;
                    loader.enemies = [];
                    loader.tiles = [];
                    loader.load();
                    enemies = [player];
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
            game.scale();
            ctx.fillStyle = game.color2(game.w, game.h, scale/game.zoomL);
            ctx.fillRect(0, 0, game.w, game.h);
            ctx.fillStyle = game.color(game.w, game.h, scale/game.zoomL);
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
                if(loader.delay) {
                    if(mapTiles[i] || outOfBounds(x, y)) {
                        ctx.fillRect(x, y, 1, 1);
                    }
                }else{
                    if(mapTiles[i] || outOfBounds(x, y)) {
                        drawTile(x, y);
                    }else{
                        drawSpace(x, y);
                    }
                }
            }
            if(worldSelect.active) for(let blob of enemies) {
                blob.draw();
            }
            game._x = gx;
        }
        ctx.resetTransform();


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
            }
            octx.globalAlpha = alpha;
            game.scale();
            // game.scale(octx);
            octx.fillStyle = loader.color2(game.w, game.h, scale/game.zoomL);
            octx.fillRect(0, 0, game.w, game.h);
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
            }
            if(loader.delay == 0) {
                loader.load();
            }
            // ctx.globalAlpha = alpha;
            // ctx.drawImage(loader.canvas, 0, 0);
            ctx.globalAlpha = 1;
        }else if(enemies.filter(blob => blob.team & TEAM.BAD).length == 0) {
            startLevel();
        }

        ctx.resetTransform();

        for(let blob of enemies) {
            blob.step();
        }
        for(let a = 0; a < game.steps; a++) {
            for(let i = 0, e = enemies.length; i < e; i++)
            {
                let blob = enemies[i];
                blob.update(blob.stepf);
                for(let j = 0; j < i; j++)
                {
                    let them = enemies[j];
                    blob.register(them);
                    them.register(blob);
                    if(Entity.isTouching(blob, them))
                    {
                        if(blob instanceof Test && them instanceof Test) {
                            blob.remove = true;
                            them.remove = true;
                        }
                        if(Entity.hitTest(blob, them)) {
                            blob.hit(them);
                            them.hit(blob);
                        }
                        if(Entity.collTest(blob, them)) {
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
        if(!worldSelect.active) for(let blob of enemies) {
            blob.draw();
        }
        enemies = enemies.filter(blob => !blob.remove);
        // ctx.strokeStyle = "red";
        // ctx.lineWidth = 1;
        // ctx.strokeRect(0, 0, innerWidth/2, innerHeight/2);
    }
}
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
}
function hex(byte) {
    var str = `${"0".repeat(4 - byte.length)}${byte}`;
    var num = parseInt(str, 2);
    return num.toString(16);
}
function binary(hex) {
    var num = parseInt(hex, 16);
    var byte = num.toString(2);
    var str = `${"0".repeat(4 - byte.length)}${byte}`;
    return str;
}
function Hex(binary) {
    var str = `${binary}${"0".repeat((4 - (binary.length % 4)) % 4)}`;
    var arr = [...str];
    var str = '';
    while(arr.length) {
        var byte = arr.splice(0, 4);
        str += hex(byte.join(""));
    }
    return str;
}
function Binary(hex) {
    return [...hex].map(hex => binary(hex)).join("");
}
//entity.js
{
    var Entity = class Entity
    {
        register(enemy) {}
        onCollide() {
        }
        clipSight() {
            let rads = [];
            let dis = 50;
            let s = this.s * .5;
            let mx = this.x + s;
            let my = this.y + s;
            var point = {x: 0, y: 0, s: 0};
            game.scale();
            ctx.beginPath();
            for(let x = 0; x < game.w; x++) for(let y = 0; y < game.h; y++)
            {
                let i = Index(x, y);
                if(!mapTiles[i]) continue;
                
                let res = [];
                for(let [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]])
                {
                    dx += x;
                    dy += y;
                    if(outOfBounds(dx, dy)) res.push(0);
                    else if(mapTiles[Index(dx, dy)]) res.push(1);
                    else res.push(0);
                }
                var point = {x, y, s: 0};
                var [t, b, l, r, tl, bl, tr, br] = res;

                if((!t && !l) || (t && l && !tl)) {
                    let rad = Entity.radian(this, point);
                    // rads.push(rad);
                    ctx.moveTo(point.x, point.y);
                    ctx.arc(point.x, point.y, .1, 0, PI2);
                    rads.push(rad + 0.0001);
                    rads.push(rad - 0.0001);
                }
                point.x += 1;
                if((!t && !r) || (t && r && !tr)) {
                    let rad = Entity.radian(this, point);
                    // rads.push(rad);
                    ctx.moveTo(point.x, point.y);
                    ctx.arc(point.x, point.y, .1, 0, PI2);
                    rads.push(rad + 0.0001);
                    rads.push(rad - 0.0001);
                }
                point.y += 1;
                if((!b && !r) || (b && r && !br)) {
                    let rad = Entity.radian(this, point);
                    // rads.push(rad);
                    ctx.moveTo(point.x, point.y);
                    ctx.arc(point.x, point.y, .1, 0, PI2);
                    rads.push(rad + 0.0001);
                    rads.push(rad - 0.0001);
                }
                point.x -= 1;
                if((!b && !l) || (b && l && !bl)) {
                    let rad = Entity.radian(this, point);
                    // rads.push(rad);
                    ctx.moveTo(point.x, point.y);
                    ctx.arc(point.x, point.y, .1, 0, PI2);
                    rads.push(rad + 0.0001);
                    rads.push(rad - 0.0001);
                }
            }
            ctx.fillStyle = "red";
            // ctx.fill();

            let first = 0;
            for(let [x, y] of [[0, 0], [0, game.h], [game.w, game.h], [game.w, 0]])
            {
                point.x = x; point.y = y;
                rads.push(Entity.radian(this, point));
            }
            rads = [...(new Set(rads))];
            rads = rads.sort((a, b) => a - b);
            // rads = new Set(rads);
            ctx.resetTransform();
            ctx.fillText(rads.length, 2, 10);
            game.scale();
            ctx.beginPath();
            for(let rad of rads) {
                let c = cos(rad);
                let s = sin(rad);
                let d = Test.lineCheck(mx, my, mx + c * dis, my + s * dis, true);
                if(!d) d = dis;
                if(first) 
                {
                    ctx.moveTo(mx + c * d, my + s * d);
                    first = false;
                }
                else ctx.lineTo(mx + c * d, my + s * d);
                // ctx.moveTo(mx, my);
                // ctx.lineTo(mx + c * d, my + s * d);
                // ctx.arc(mx + c * d, my + s * d, .1, 0, PI2)
            }
            // var color = ctx.createRadialGradient(mx, my, 0, mx, my, 15);
            // color.addColorStop(0, "#fffa");
            // color.addColorStop(1, "#0000");
            ctx.fillStyle = "#fff2";
            ctx.fill();
            ctx.resetTransform();
        }
        drawWith(ctx, obj) {
            obj = {...this, ...obj};
            obj.pen = this.pen;
            this.draw.call(obj, ctx);
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
            if(this.dead) ++this.dead;
            if(this.dead >= DEAD) this.remove = 1;
            if(this.wallInv > 0) {
                if(!this.inWall(0, tiles)) {
                    this.wallInv = 0;
                }else this.wallTick();
            }
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
            var s = (a.s - b.s)/2;
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
            if(a.inv?.has(b)) return;
            if(b.inv?.has(a)) return;
            if(a.dead || a.remove) return;
            if(b.dead || b.remove) return;
            if(a.nohit & b.team || b.nohit & a.team) return 0;
            return (a.hits & b.team) || (b.hits & a.team);
        }
        pen(ctx=game.ctx, {fill, stroke, scale=1, shape:shp=this.shape, r=0}, hp)
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
            ctx.globalAlpha = alpha;
            game.zoom(x, y, s, s, r, 0, 0, ctx);
            if(!isNaN(hp)) {
                if(this.hp < this.xhp) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(.5, .5);
                    ctx.arc(.5, .5, 3, -hp, -hp + PI2 * this.hp/this.xhp);
                    ctx.closePath();
                    ctx.clip();
                }
            }
            if(fill) {
                ctx.fillStyle = fill;
                ctx.fill(shape(shp));
            }
            if(stroke) {
                ctx.strokeStyle = stroke;
                ctx.stroke(shape(shp));
            }
            if(!isNaN(hp)) {
                if(this.hp < this.xhp) {
                    ctx.restore();
                }
            }

            ctx.globalAlpha = 1;
            ctx.strokeStyle = "red";
            // for(let {x, y, s} of this.boxes) {
            //     game.zoom(x, y, s, s);
            //     ctx.strokeRect(0, 0, 1, 1);
            // }
            ctx.resetTransform();
        }
        draw(ctx) {
            var r = atan(this.vy, this.vx)
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
        }
        static distance = (a, b) =>
        {
            var s = (a.s - b.s)/2;
            return dist(a.y - b.y + s, a.x - b.x + s);
        }
        static rawDistance = (a, b) =>
        {
            var s = (a.s - b.s)/2;
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
            if(this.wallInv == 100) {
                var save = new Wall_Fix(this);
                save.spawn();
                enemies.push(save);
            }
        }
        hit(who) {
            who.onHit(this.atk, this);
        }
        onHit(atk=0, who) {
            this.hp -= atk;
            if(this.hp <= 0) {
                this.dead = 1;
                this.m /= 10;
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
        dead = 0;
        lcoll = new Map;
        s = 0.4;
    }
}
var TEAM = {
    GOOD  : 1 << 0,
    ALLY  : 1 << 1,
    BAD   : 1 << 2,
    ENEMY : 1 << 3,
    BULLET: 1 << 4
};
//player.js
{
    var Player = class Player extends Entity
    {
        color = "#55f";
        color2 = "#aaf";
        shape = "square.3";
        tick()
        {
            this.keys();
            this.stats();
        }
        skill(rad) {}
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
                this.skill(srad);
            }

            if(mouse.d) {
                let {x, y} = mouse;
                let s = this.s*.5;
                x = x/scale - game._x;
                y = y/scale - game._y;
                x -= this.x + s;
                y -= this.y + s;
                var srad = atan(y, x);
                this.skill(srad);
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
    }
    var Gunner = class Gunner extends Player{
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
        stats() {
            super.stats();
            if(this.lastShot) --this.lastShot;

            if(this.lastSkill > 40) {
                this.color2 = "#f55";
                this.r = this.lastSkill * .5;
                this.team = 0;
                this.hits = 0;
                this.coll = 0;
                this.alpha = .2;
            }else if(this.lastSkill) {
                this.alpha = 1;
                this.color2 = "#f55";
                this.team = TEAM.GOOD;
                this.hits = TEAM.BAD;
                this.coll = TEAM.ALLY & TEAM.ENEMY;
            }else{
                this.alpha = 1;
                this.color2 = "#aaf";
                this.team = TEAM.GOOD;
                this.hits = TEAM.BAD;
                this.coll = TEAM.ALLY & TEAM.ENEMY;
            }
        }
        ability(key, mrad, srad) {
            if(!this.lastSkill) {
                if(!isNaN(mrad)) {
                    this.move(mrad, 15);
                }
                this.lastSkill = 50;
            }
        }
        skill(rad) {
            if(!this.lastShot) {
                this.move(rad + PI, 5);
                var blob = new Bullet(this, rad);
                blob.nocoll = TEAM.GOOD;
                enemies.push(blob);
                this.lastShot = 15;
            }
        }
    }
    var Enemy = class Enemy extends Entity
    {
        color = "red";
        team = TEAM.ENEMY | TEAM.BAD;
        coll = TEAM.ENEMY | TEAM.ALLY;
        hits = TEAM.GOOD;
        b = 1;
    };
    var Chill = class Chill extends Enemy{
        color = "#afa";
    };
    var Turret = class Turret extends Enemy{
        shape = 'square.4';
        color = "#666";
        color2 = "#ff5";
        tick() {
            if(this.lastShot) --this.lastShot;
            var {target} = this;
            if(!target) return;
            var rad = Entity.radian(this, target);
            var d = rDis(this.r, rad);
            var m = 0.2;
            if(abs(d) < m) this.r = rad;
            else this.r += m * sign(d);

            this.skill(this.r);

            delete this.target;
            delete this.clo;
        }
        skill(rad) {
            if(!this.lastShot) {
                // this.move(rad + PI, 5);
                var blob = new Bullet(this, rad);
                blob.nocoll = TEAM.BAD;
                // blob.lcoll.set(this, 200);
                blob.spd = this.spd;
                blob.f = this.f;
                blob.draw = super.draw;
                blob.time = 100;
                blob.shape = this.shape;
                enemies.push(blob);
                this.lastShot = 30;
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
            var clo = this.clo * this.clo;
            var a = dis < d && (!this.clo || dis < clo);
            if(!a) return;
            if(!this.sightCheck(enemy)) return;
            var {x, y, s} = enemy;
            this.target = {x, y, s};
            this.clo = dis;
        }
        draw(ctx) {
            var r = this.r;
            this.pen(ctx, {fill: this.color, r}, 0);
            this.pen(ctx, {stroke: this.color, r});
            this.pen(ctx, {fill: this.color2, stroke: this.color2, r, scale: .5}, 0);
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
                // ctx.fillStyle = "blue";
                // ctx.beginPath();
                // ctx.arc(px * scale, py * scale, .1 * scale, 0, PI2);
                // ctx.fill();
                let x = floor(px);
                let y = floor(py);
                
                // ctx.globalAlpha = 0.1;
                // ctx.fillRect(x, y, 1, 1);
                // ctx.globalAlpha = 1;

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
                    // ctx.strokeStyle = "orange";
                    // ctx.beginPath();
                    // ctx.moveTo(px, py);
                    // ctx.lineTo(px + mx * sign(ux), py);
                    // ctx.stroke();
                }else{
                    var m = ty;
                    // ctx.strokeStyle = "purple";
                    // ctx.beginPath();
                    // ctx.moveTo(px, py);
                    // ctx.lineTo(px, py + my * sign(uy));
                    // ctx.stroke();
                }
                m += 0.0001;

                px += ux * m;
                py += uy * m;
                i += m;
            }
            // ctx.beginPath();
            // ctx.lineWidth = 0.05;
            // ctx.strokeStyle = see? "green": "red";
            // ctx.moveTo(sx, sy);
            // ctx.lineTo(ex, ey);
            // ctx.stroke();
            // ctx.resetTransform();

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
            this.move(atan(this.vy, this.vx));
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
            Bullet.position(this, r, parent);
        }
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
        static position(what, rad, parent) {
            if(!parent) parent = what.parent;
            var s = what.s * .5;
            var ps = parent.s;
            what.r = rad;
            var c = cos(rad), s = sin(rad);

            c *= 0;
            s *= 0;

            what.lcoll.set(parent, 30);

            what.ox = parent.x + ps/2 - what.s/2 + ps;
            what.oy = parent.y + ps/2 - what.s/2 + ps;

            what.x = parent.x + ps/2 - what.s/2 + c * ps;
            what.y = parent.y + ps/2 - what.s/2 + s * ps;
        }
        s = 0.2;
        m = 0.1;
    };
    var Wall = class Wall extends Mover{
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
                        this.lastT = 40;
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
        coll = TEAM.GOOD | TEAM.BAD;
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
        brainMove() {
            var lines = [];
            var max;
            var add = (PI * 2)/64;
            for(let a = 0; a < PI * 2; a += add) {
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
            // this.vx += cos(rad) * this.spd * max;
            // this.vy += sin(rad) * this.spd * max;
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

            var d = 3;
            var p = 5;
            var o = PI * .125;

            for(let i = 0; i < 16; i++) {
                var c = cos(o * i) * d;
                var s = sin(o * i) * d;
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
                    this.brainPoints.push([o * i, -n * .2]);
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
        draw = Turret.prototype.draw;
        tick(tiles) {
            this.r = this.rad;
            var enemy = this.target;
            this.wander = .5;
            if(enemy) {
                if(!enemy.c) {
                    var dis = Entity.distance(this, enemy);
                    this.clo = dis*dis;
                    var d = 15;
                    if(dis < d*d) {
                        dis = dis**.5;
                        var n = (dis - d)/-d;
                        var rad = Entity.radian(this, enemy);
                        n **= .5;
                        this.brainPoints.push([rad, n]);
                    }
                    if(dis < this.s*1.5) {
                        enemy.c = 1;
                    }
                    this.wander = .1;
                }else{
                    this.wander = 1;
                }
                if(enemy.time > 49) {
                    this.clo = 15*15;
                }
                --enemy.time;
                if(!enemy.time || dis > d)
                {
                    delete this.target;
                    delete this.clo;
                }
            }
            // if(this.target) {
            //     if(this.target.time >= 99) this.color = "red";
            //     else this.color = "yellow";
            // }else this.color = "green";
            super.tick(tiles);
        }
        register(enemy) {
            if((this.team & enemy.team) && !(enemy.team & TEAM.BULLET)) {
                var dis = Entity.rawDistance(this, enemy);
                var d = (enemy.s + this.s)*1.5;
                var a = dis < d*d;
                if(!a) return;
                // if(!this.sightCheck(enemy)) return;
                dis = dis**.5;
                if(dis < d) {
                    var n = (dis - d)/-d;
                    var rad = Entity.radian(this, enemy);
                    n **= 2;
                    this.brainPoints.push([rad, -n]);
                }
            }
            if(!(this.hits & enemy.team) || enemy.team & TEAM.BULLET) return;
            var dis = Entity.rawDistance(this, enemy);
            var d = 10;
            var a = dis < d*d && (dis < this.clo || !this.clo);
            if(!a) return;
            if(!this.sightCheck(enemy)) return;
            var {x, y, s} = enemy;
            this.target = {x, y, s, time: 50};
            this.clo = dis;
        }
    }
}
{
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
        time = 0;
        phase = 2;
        isPlayer(what) {
            return (what.team & TEAM.GOOD) && !(what.team & TEAM.BULLET);
        }
        step() {
            super.step();
            delete this.target;
        }
        register(what) {
            if(!this.isPlayer(what)) return;
            this.target = what;
        }
        onHit(atk, who) {
            super.onHit(atk, who);
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
            var {target} = this;
            switch(this.phase) {
                case 0:if(target) {
                    var rad = Entity.radian(this, target);
                    this.move(rad);
                }break;
                case 1:
                    ++this.time;
                    if(this.time >= 30) {
                        for(let i = 0; i < 4; i++) {
                            let r = PI*.5*i;
                            var blob = new Mover();
                            blob.color = this.color;
                            blob.color2 = this.color2;
                            Bullet.position(blob, r, this);
                            blob.nocoll = TEAM.BAD;
                            enemies.push(blob);
                        }
                        ++this.phase;
                        this.time = 0;
                        this.color = "#ff5";
                        this.color2 = "#aa0";
                    }
                break;
                case 2:
                    super.tick();
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
    function loadLevel(obj, world) {
        loader.delay = 51;
        loader.time  = 51;
        loader.color = world.color;
        loader.color2 = world.color2;
        loader.dir = 0;
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
                // if(worldSelect.active) {
                    blob.nospawn = (tiles=mapTiles) => {
                        for(let them of loader.enemies) {
                            if((Entity.hitTest(blob, them) || Entity.collTest(blob, them)) && Entity.isTouching(blob, them)) {
                                return true;
                            }
                        }
                        return blob.inWall(0, tiles);
                    }
                // }
                blob.spawn(loader.tiles);
                loader.enemies.push(blob);
            }
        }
    }
    var tutorial = {
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
    {
        let canv = document.createElement("canvas");
        let ctx1 = canv.getContext("2d");
        let canv2 = document.createElement("canvas");
        let ctx2 = canv2.getContext("2d");
        canv.width = 100;
        canv.height = 100;
        canv2.width = 100;
        canv2.height = 100;
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
        var test = {
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
            }],
            color2: (w, h, z) => {
                let col = ctx.createPattern(canv, "repeat");
                col.setTransform(zoomMatrix(0, 0, 1/z, 1/z));
                return col;
            },
            color: (w, h, z) => {
                let col = ctx.createPattern(canv2, "repeat");
                col.setTransform(zoomMatrix(0, 0, 1/z, 1/z));
                return col;
            }
        }
    }
    let worlds = [tutorial, test];
    let selectedWorld = 1;
    let loadedWorld = -1;
    let selectedLevel = 0;
    let loadedLevel = -1;
    let dir;
    let mnu = 0;
    var worldSelect = function worldSelect() {
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
            if(mnu) loadLevel(wrld, sWorld);
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
            }
            ctx.fillStyle = c1;
            ctx.fillText(label, (game.width-wid)*.5, h * 9.4);
        }

        if(keys.use("ArrowRight")) {
            if(mnu) selectedLevel = loop(sworld+1, wrlds.length);
            else selectedWorld = loop(sworld + 1, wrlds.length);
            dir = 1;
            if(loader.delay) loader.load();
        }
        if(keys.use("ArrowLeft")) {
            if(mnu) selectedLevel = loop(sworld-1, wrlds.length);
            else selectedWorld = loop(sworld + 1, wrlds.length);
            dir = -1;
            if(loader.delay) loader.load();
        }
        if(keys.use("Space")) {
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
                player = new Gunner().spawn();
                enemies = [player];
                level = selectedLevel;
                game.stepM = 1;
            }
        }
    };
    worldSelect.active = true;
};
onload = () =>
{
    onresize();
    document.body.appendChild(canvas);
    init();
};
