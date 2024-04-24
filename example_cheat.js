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
        this.settings = { aimbotFov: 75 };
        this.state = { canShoot: true };

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

        const width = innerWidth / this.scale;
        const height = innerHeight / this.scale;

        this.controls.target = null;

        // auto jump (hold space to bhop)
        
        if (this.pressedKeys.has(" ")) {
            this.controls.keys[this.controls.binds.jump.val] ^= 1;

            if (this.controls.keys[this.controls.binds.jump.val])
                this.controls.didPressed[this.controls.binds.jump.val] = 1;
        }

        // fov aimbot

        if (input[keyEnum.scope] || this.me.weapon.noAim) {
            const enemies = this.game.players.list.filter(player => (!player.isYou && (!this.me.team || player.team !== this.me.team)));

            for (const enemy of enemies) {
                if (enemy.health <= 0 || !enemy.active || !enemy.cnBSeen) continue;

                const pos = new this.three.Vector3(enemy.x, enemy.y, enemy.z);

                const headScreenPos = this.world2Screen(pos.clone(), width, height, enemy.height);

                const screenCenter = {
                    x: width / 2,
                    y: height / 2
                }

                const delta = {
                    x: screenCenter.x - headScreenPos.x,
                    y: screenCenter.y - headScreenPos.y
                }

                const distanceToCenter = Math.hypot(delta.x, delta.y);

                if (distanceToCenter > (this.settings.aimbotFov / this.scale)) continue;
                
                const dir = {
                    x: ((this.calcXRotation(this.me.x, this.me.y, this.me.z, pos.x, pos.y - enemy.crouchVal * 3 + this.me.crouchVal * 3 + 0.8, pos.z)) - 0.3 * this.me.recoilAnimY - 0.1 * this.me.landBobY) * 1000,
                    y: (this.getDirection2D(this.me.z, this.me.x, pos.z, pos.x)) * 1000
                }

                this.controls.target = {
                    xD: dir.x / 1000,
                    yD: dir.y / 1000
                }

                this.controls.update(250);

                // triggerbot

                if (this.me.didShoot) {
                    input[keyEnum.shoot] = 0;
                    this.state.canShoot = false;

                    setTimeout(() => (this.state.canShoot = true), this.me.weapon.rate * (this.me.isKranked ? this.game.mode.bonuses.firerate : 1));
                } else if (this.state.canShoot)
                    input[keyEnum.shoot] = 1;

                break;
            }
        }

        return input;
    },

    render() {            
        const width = innerWidth / this.scale;
        const height = innerHeight / this.scale;

        // aimbot fov circle

        this.ctx.strokeStyle = "#fff";
        this.ctx.beginPath()
        this.ctx.arc(width / 2, height / 2, this.settings.aimbotFov / this.scale, 0, 2 * Math.PI);
        this.ctx.stroke();

        // esp + nametag

        const enemies = this.game.players.list.filter(player => (!player.isYou && (!this.me.team || player.team !== this.me.team)));

        for (const enemy of enemies) {
            const pos = new this.three.Vector3(enemy.x, enemy.y, enemy.z);
            
            if (enemy.health <= 0 || !enemy.active) continue;
            if (!this.containsPoint(pos)) continue;

            const top = this.world2Screen(pos.clone(), width, height, enemy.height + 1);
            const bottom = this.world2Screen(pos.clone(), width, height);

            const rectHeight = Math.round(bottom.y - top.y);
            const rectWidth = Math.round(rectHeight * 0.65);

            this.ctx.lineWidth = Math.min(1 + rectWidth / 30, 2);
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
    },

    getDirection2D(x1, y1, x2, y2) {
        return Math.atan2(y1 - y2, x1 - x2);
    },

    getDistance3D(x1, y1, z1, x2, y2, z2) {
        const deltaX = x1 - x2;
        const deltaY = y1 - y2;
        const deltaZ = z1 - z2;
        
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    },

    calcXRotation(x1, y1, z1, x2, y2, z2) {
        const height = Math.abs(y1 - y2);
        const distance = this.getDistance3D(x1, y1, z1, x2, y2, z2);
        
        return Math.asin(height / distance) * (y1 > y2 ? -1 : 1);
    }
});
