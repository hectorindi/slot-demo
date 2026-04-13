import { Application, Assets, AssetsManifest } from "pixi.js";
import "@esotericsoftware/spine-pixi-v8";

import { GameView } from "./GameView";


const gameWidth = 1280;
const gameHeight = 720;


(async () => {
    const app = new Application();
    let gameView: GameView;

    await new Promise((resolve) => {
        window.addEventListener("load", resolve);
    });

    await app.init({ backgroundColor: 0xd3d3d3, width: gameWidth, height: gameHeight });

    await loadGameAssets();

    async function loadGameAssets(): Promise<void> {
        const manifest = {
            bundles: [
                { name: "symbols", assets: [{ alias: "symbols", src: "./assets/symbols.json" }] },
                {
                    name: "layoutData",
                    assets: [{ alias: "layoutData", src: "./layouts/layout.json" }],
                },
                {
                    name: "configData",
                    assets: [{ alias: "configData", src: "./layouts/config.json" }],
                },
            ],
        } satisfies AssetsManifest;

        await Assets.init({ manifest });
        await Assets.loadBundle(["configData", "layoutData", "symbols"]);
        await addAssets();

        document.body.appendChild(app.canvas);
        const style = document.createElement('style');
        style.textContent = `
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
                touch-action: none;
            }
            canvas {
                display: block !important;
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw !important;
                height: 100vh !important;
            }
        `;
        document.head.appendChild(style);
        resizeCanvas();
    }

    async function addAssets() {
        gameView = new GameView();
        app.stage.addChild(gameView);
    }

    function positionElements() {
        const scaleX = window.innerWidth / 1280;
        const scaleY = window.innerHeight / 720;
        const scale = Math.min(scaleX, scaleY);

        gameView.scale.set(scale, scale);
        gameView.position.set(window.innerWidth / 2, window.innerHeight / 2);
        gameView.reSize();
    }

    function resizeCanvas(): void {
        const resize = () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            positionElements();
            app.canvas.style.width = window.innerWidth.toString() + "px";
            app.canvas.style.height = innerHeight.toString() + "px";
        };

        resize();
        window.addEventListener("resize", resize);
    }
})();
