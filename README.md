# Skeleton
- Baseplate for creating Krunker cheats

## Usage
```js
new Cheat(gameSourceUrl, { init, inputs, render }, methods);
```

- `gameSourceUrl` - game source code to load

- `init` runs once after setup (used for initializing a GUI)
  - note: you must create your own event listeners (`DOMContentloaded`, etc)
- `inputs` and `render` run once each frame

- `methods` is a dictionary/object of custom functions that will be attached to the Cheat instance (`this`)
  - e.g. `this.distance3D`
- Read `example_cheat.js` <3

<hr>

## How to import
- Tampermonkey (browser)
  - add `@require https://raw.githubusercontent.com/brread/skeleton/main/skeleton.js` to the script header
- Node.js (client)
  - Use `fetch` (`Cheat` will be defined as `window.Cheat`):
    ```js
    // in an async function
    const data = await fetch("https://raw.githubusercontent.com/brread/skeleton/main/skeleton.js");
    const code = await data.text();

    Function(code)(); // or eval(code);
    
    // or
    fetch("https://raw.githubusercontent.com/brread/skeleton/main/skeleton.js")
        .then(data => data.text())
        .then(eval) // or code => Function(code)()

    new window.Cheat(...);
    ```
  - Use `import` syntax:
      ```js
      // skeleton.js
      module.exports = Cheat;

      // package.json (or use your_cheat.mjs instead of your_cheat.js)
      "type": "module"

      // your_cheat.(m)js
      import Cheat from "./skeleton.js";
      ```  
  - Use `require` syntax:
      ```js
      // skeleton.js
      module.exports = Cheat;

      // your_cheat.js
      const Cheat = require("./skeleton.js");
      ```  
