# Skeleton
- Baseplate for creating Krunker cheats

## Usage
```js
new Cheat(gameSourceUrl, { inputs, render, ... });
```

`gameSourceUrl` - game source code to load

`inputs` and `render` will be attached to the Cheat instance (`this`) and ran every frame
- custom methods can be attached (e.g. `getDist3D` or `world2Screen`)

<hr>

### Example code
```js
import Cheat from "./skeleton.js";

new Cheat("https://sub2krunkercentral.com/game_1_4.js", {
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

        console.log("Inputs test");
    
        return input;
    },

    render() {
        const scale = this.scale || parseFloat(RegExp(/\((.+)\)/).exec(document.getElementById("uiBase").style.transform)[1]);
        const width = innerWidth / scale;
        const height = innerHeight / scale;

        console.log("Rendering test");
    }
});
```
