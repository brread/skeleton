window.Cheat = class Cheat {
    constructor(gameSourceUrl, { init, inputs, render }, methods) {
        window.cheat = this;

        this.init = init.bind(this);
        this.inputs = inputs.bind(this);
        this.render = render.bind(this);

        for (const fn in methods)
            this[fn] = methods[fn].bind(this);

        const gameSource = this.download(gameSourceUrl);

        hook(gameSource);
        this.defines();
        this.init();
    }

    download(url) {
        const request = new XMLHttpRequest();

        request.open("GET", url, false);
        request.send();

        return request.response;
    }

    defines() {
        this.isProxy = Symbol("isProxy");

        Object.defineProperties(Object.prototype, {
            canvas: {
                set(canvas) {
                    this._canvas = canvas;
                    if (canvas.id !== "game-overlay") return;

                    window.cheat.ctx = canvas.getContext("2d");

                    Object.defineProperties(this, {
                        render: {
                            set(val) {
                                this._render = new Proxy(val, {
                                    apply(_target, _that, args) {
                                        ["scale", "game", "controls", "renderer", "me"].forEach((name, index) => {
                                            window.cheat[name] = args[index];
                                        });

                                        Reflect.apply(...arguments);

                                        if (!window.cheat.me || !window.cheat.ctx) return;

                                        window.cheat.ctx.save();
                                        window.cheat.ctx.scale(window.cheat.scale, window.cheat.scale);
                                        window.cheat.render();
                                        window.cheat.ctx.restore();

                                        if (!window.cheat.me.procInputs[window.cheat.isProxy]) {
                                            window.cheat.me.procInputs = new Proxy(window.cheat.me.procInputs, {
                                                apply(_target, that, [input, game, recon, lock]) {
                                                    if (that) window.cheat.inputs(input);

                                                    return Reflect.apply(...arguments);
                                                },

                                                get(target, key) {
                                                    if (key === window.cheat.isProxy) return true;

                                                    return Reflect.get(target, key);
                                                }
                                            });
                                        }
                                    }
                                });
                            },

                            get() { return this._render }
                        }
                    });
                },

                get() { return this._canvas }
            },

            OBJLoader: {
                set(val) {
                    window.cheat.three = this;
                    this._value = val;
                },
                get() {
                    return this._value;
                },
            },
        });
    }

    // defaults
    inputs(input) { return input }
    render() { }
}

// "Socket Error" when this is a method of the Cheat class
function hook(gameSource) {
    let tokenPromiseResolve;
    const tokenPromise = new Promise((resolve) => (tokenPromiseResolve = resolve));

    const frame = document.createElement("iframe");

    frame.src = location.href;
    frame.style.display = "none";
    document.documentElement.append(frame);

    const iframeFetch = frame.contentWindow.fetch;

    frame.contentWindow.fetch = function (url) {
        if (typeof url === "string" && url.includes("/seek-game")) {
            frame.remove();
            tokenPromiseResolve(url);
            return;
        }

        return iframeFetch.apply(this, arguments);
    }

    const _fetch = window.fetch;

    window.fetch = async function (url, _args) {
        if (typeof url === "string" && url.includes("/seek-game")) {
            url = await tokenPromise;
        }

        return _fetch.apply(this, arguments);
    };

    const observer = new MutationObserver((mutationList) => {
        let isHooked = false;
        
        mutationList.forEach(mutation => {
            if (mutation.addedNodes) {
                for (const node of mutation.addedNodes) {
                    if (!isHooked && node.tagName === "SCRIPT" && node.innerHTML.includes("@license Krunker.io")) {
                        node.remove();
                        Function(gameSource)();
                        observer.disconnect();
                        isHooked = true;
                    }
                }
            }
        });
    });

    observer.observe(document, {
        childList: true,
        subtree: true,
    });
}
