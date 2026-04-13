import { ResultGenerator, WinResult } from "../data/ResultGenerator";
import { ReelData } from "../data/ReelData";
import { BaseView } from "./BaseView";
import { ReelView } from "./ReelView";
import { Assets, Container } from "pixi.js";
import { Spine, SpineTexture } from '@esotericsoftware/spine-pixi-v8';

export class SlotViews extends BaseView {

    private reels: ReelView[] = [];
    private character: Spine;
    private resultGenerator: ResultGenerator = new ResultGenerator();
    private _totalPayout: number = 0;
    public stopPromise!: Promise<void>;

    public initView(): void {
        super.initView();
        this.reels = [];
        const reelsContainer = new Container();
        this.addChild(reelsContainer);
        this.createReels(reelsContainer);
        this.addSpineChar();
    }

    async addSpineChar() {
        Assets.add({
            alias: 'character',
            src: 'assets/spine-assets/character.json'
        });
        Assets.add({
            alias: 'character-atlas',
            src: 'assets/spine-assets/character.atlas'
        });

        await Assets.load(['character', 'character-atlas']);
        this.character = Spine.from({
            skeleton: 'character',
            atlas: 'character-atlas',
        });

        this.character.position.set(-600, 200);
        this.character.scale.set(0.4, 0.4);
        this.character.state.setAnimation(0, 'character_idle', true);
        this.addChild(this.character);
    }

    private createReels(container: Container): void {
        const { slotSize, cellSize } = this.config.slot;
        const offset = 10;
        let currentX = -730;
        const startY = -300;

        for (let i = 0; i < slotSize[0]; i++) {
            const reelData = new ReelData(i);
            this.resultGenerator.setupSpinQueue(reelData);

            const reel = new ReelView("reel", i, reelData);
            container.addChild(reel);

            currentX += cellSize[0] + offset;
            reel.position.set(currentX, startY);
            this.reels.push(reel);
        }

        this.reSize();
    }

    public startSpin(): void {
        this.character.state.setAnimation(0, 'character_bonus_anticipation', false);
        this.reels.forEach(reel => reel.prepareToSpin());
    }

    async stopSpin(): Promise<void> {
        const winStopIndices = this.resultGenerator.pickWinStopIndices();
        const visibleGrid: number[][] = this.reels.map((reel) =>
            this.resultGenerator.setupStopResult(reel.reelData, winStopIndices)
        );
        this.reels.forEach(reel => reel.stopSpin());

        return Promise.all(this.reels.map(reel => reel.stopPromise))
            .then(() => {
                const wins = this.resultGenerator.calculateWins(visibleGrid);
                this.onWinsCalculated(wins);
            });
    }

    private onWinsCalculated(wins: WinResult[]): void {
        if (wins.length === 0) {
            console.log("[SlotViews] No win this spin.");
            return;
        }

        this._totalPayout = 0;
        let winningPositions: number[][] = [];

        wins.forEach(win => {
            this._totalPayout += win.payout;
            win.positions.forEach((row, reelIndex) => {
                winningPositions.push([reelIndex, row]);
            });
        });

        winningPositions.forEach(position => {
            const reel = this.reels[position[0]];
            reel.showWinningSymbols(true, position[1]);
        });

        console.log(`[SlotViews] Total payout: ${this._totalPayout}×`);
        this.character.state.setAnimation(0, 'character_bonus_anticipation_win', false);
    }

    public get totalPayout() {
        return this._totalPayout;
    }

    public tick(): void {
        this.reels.forEach(reel => reel.tick());
    }

    public reSize(): void {
        super.reSize();
    }
}