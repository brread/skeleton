// ==UserScript==
// @name        example krunker hack
// @match       *://krunker.io/*
// @grant       none
// @version     1.0
// @author      bread
// @description made using Skeleton
// @require     https://raw.githubusercontent.com/brread/skeleton/main/skeleton.js
// @run-at      document-start
// @noframes
// ==/UserScript==

new Cheat("https://sub2krunkercentral.com/game_1_4.js", {
    init() {
        this.pressedKeys = new Set();

        window.addEventListener("keydown", event => this.pressedKeys.add(event.key.toLowerCase()));
        window.addEventListener("keyup", event => this.pressedKeys.delete(event.key.toLowerCase()));

        console.log("Cheat initialized!");
    },

    inputs(input) {
        const keyEnum = {
            frame: 0,
            delta: 1,
            xdir: 2,
            ydir: 3,
            moveDir: 4,
            shoot: 5,
            scope: 6,
            jump: 7,
            reload: 8,
            crouch: 9,
            weaponScroll: 10,
            weaponSwap: 11,
            moveLock: 12,
        };

        // auto jump (hold space to bhop)
        if (this.pressedKeys.has(" ")) {
            this.controls.keys[this.controls.binds.jump.val] ^= 1;

            if (this.controls.keys[this.controls.binds.jump.val])
                this.controls.didPressed[this.controls.binds.jump.val] = 1;
        }

        return input;
    },

    render() {
        const scale = this.scale || parseFloat(RegExp(/\((.+)\)/).exec(document.getElementById("uiBase").style.transform)[1]);
        const width = innerWidth / scale;
        const height = innerHeight / scale;

        // simple box esp + nametag

        const enemies = this.game.players.list.filter(player => (!player.isYou && (!this.me.team || player.team !== this.me.team)));

        for (const enemy of enemies) {
            const pos = new this.three.Vector3(enemy.x, enemy.y, enemy.z);

            if (enemy.health <= 0 || !enemy.active) continue;
            if (!this.containsPoint(pos)) continue;

            const top = this.world2Screen(pos.clone(), width, height, enemy.height);
            const bottom = this.world2Screen(pos.clone(), width, height);

            const rectHeight = Math.round(bottom.y - top.y);
            const rectWidth = Math.round(rectHeight * 0.65);

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#f00";

            this.ctx.strokeRect(Math.round(top.x - rectWidth / 2), Math.round(top.y), Math.round(rectWidth), Math.round(rectHeight));

            if (enemy.cnBSeen) continue;

            this.ctx.font = "Arial 24px";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "#fff";

            let nametagText = enemy.alias;
            
            if (enemy.clan) nametagText += ` [${enemy.clan}]`;

            this.ctx.fillText(nametagText, Math.round(top.x), Math.round(top.y) - 5);
        }
    }
}, {
    world2Screen(pos, width, height, offsetY = 0) {
        pos.y += offsetY;

        pos.project(this.renderer.camera);

        pos.x = (pos.x + 1) / 2;
        pos.y = (-pos.y + 1) / 2;

        pos.x *= width;
        pos.y *= height;

        return pos;
    },

    containsPoint(point) {
        const { planes } = this.renderer.frustum;

        for (let i = 0; i < 6; i++)
            if (planes[i].distanceToPoint(point) < 0)
                return false;

        return true;
    }
});
