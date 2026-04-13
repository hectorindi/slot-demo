import { ReelData } from "../data/ReelData";
import { SymbolData } from "../data/SymbolData";
import { MathFunctionUtils } from "../utils/MathFunctionUtils";
import { BaseView } from "./BaseView";
import { SymbolView } from "./SymbolView";
import { Assets, Container, ContainerOptions, Graphics } from "pixi.js";

export class ReelView extends BaseView {
    private reelMask!: Graphics;
    private symbolsContainer!: Container;

    private symbolViewList: SymbolView[] = [];
    private readonly id: number;

    private _reelData: ReelData;
    private cellSize!: [number, number];
    private visibleRows!: number;

    private started: boolean = false;
    private isStopping: boolean = false;

    private stopResolve!: () => void;
    public stopPromise!: Promise<void>;

    constructor(layout: string, id: number, reelData: ReelData, options?: ContainerOptions) {
        super(layout, options);
        this.id = id;
        this._reelData = reelData;
        this.initView();
        this.initializeSymbols();
    }

    protected initView(): void {
        this.cellSize = this.config.slot.cellSize;
        this.visibleRows = this.config.slot.slotSize[1];
        const [cellW, cellH] = this.cellSize;
        const visibleHeight = cellH * this.visibleRows;

        this.symbolsContainer = new Container();
        this.addChild(this.symbolsContainer);

        this.reelMask = new Graphics()
            .rect(0, 0, cellW, visibleHeight)
            .fill(0xffffff);
        this.addChild(this.reelMask);
        this.symbolsContainer.mask = this.reelMask;

        this._reelData.bottomPositionY = visibleHeight;
    }

    private initializeSymbols(): void {
        const layout = Assets.get("layoutData")["symbol"];
        const cellH = this.cellSize[1];

        for (let row = -1; row < this.visibleRows; row++) {
            const symbolId = MathFunctionUtils.getRandomInRange(0, 9);
            const symbolView = new SymbolView(
                `${this.config.slot.symbols[symbolId].class}`,
                layout
            );
            symbolView.initialize(new SymbolData(symbolId, [this.id, row]));
            symbolView.move(0, row * cellH);
            this.symbolsContainer.addChild(symbolView);
            this.symbolViewList.push(symbolView);
        }
    }

    public prepareToSpin(): void {
        if (this.started) return;
        this.symbolViewList.forEach(symbolView => {
            symbolView.resetWin();
        })
        this.started = true;
        this.isStopping = false;
    }

    public stopSpin(): void {
        this.isStopping = true;
        this.stopPromise = new Promise<void>(resolve => this.stopResolve = resolve);
    }

    public tick(): void {
        if (!this.started) return;
        if (this.isStopping) {
            this.reelStopping();
        } else {
            this.reelSpinning();
        }
    }

    private reelSpinning(): void {
        this.moveSymbols();
        this.recycleSpinSymbol();
    }

    private recycleSpinSymbol(): void {
        const bottom = this.bottomSymbol();
        const threshold = this._reelData.bottomPositionY;

        if (bottom.y >= threshold) {
            const top = this.topSymbol();
            bottom.initialize(this._reelData.getNextSpinSymbol());
            bottom.move(0, top.y - this.cellSize[1]);
        }
    }

    private reelStopping(): void {
        this.moveSymbols();
        this.recycleStopSymbol();
    }

    private recycleStopSymbol(): void {
        const bottom = this.bottomSymbol();
        const threshold = this._reelData.bottomPositionY;

        if (bottom.y >= threshold) {
            const nextStop = this._reelData.getNextStopSymbol();

            if (nextStop) {
                const top = this.topSymbol();
                bottom.initialize(nextStop);
                bottom.move(0, top.y - this.cellSize[1]);
            } else {
                this.finishStop();
            }
        }
    }

    private finishStop(): void {
        this.snapToGrid();
        this.isStopping = false;
        this.started = false;
        this.stopResolve();
    }

    private snapToGrid(): void {
        const cellH = this.cellSize[1];
        const finalIds = this._reelData.stopSymbolIdList;
        const totalSlots = finalIds.length;

        const sorted = [...this.symbolViewList].sort((a, b) => a.y - b.y);

        sorted.forEach((view, i) => {
            const idIndex = (i + 1) % totalSlots;
            const symbolId = finalIds[idIndex];
            const row = idIndex - 1;
            view.initialize(new SymbolData(symbolId, [this.id, row]));
            console.log(`[ReelView] Reel [this.id, row] ${[this.id, row]} stopped. and symbolId is ${symbolId} `);
            view.move(0, row * cellH);
        });

    }

    public showWinningSymbols(win: boolean, rowIndex: number): void {
        this.symbolViewList.forEach((view) => {
            const isWinner = win && view.data.cell[1] === rowIndex;
            if (isWinner) view.showWin();
        });
    }
    private moveSymbols(): void {
        const speed = 25;
        this.symbolViewList.forEach(sv => sv.move(sv.x, sv.y + speed));
    }

    private bottomSymbol(): SymbolView {
        return this.symbolViewList.reduce((a, b) => a.y > b.y ? a : b);
    }

    private topSymbol(): SymbolView {
        return this.symbolViewList.reduce((a, b) => a.y < b.y ? a : b);
    }

    public get reelData(): ReelData {
        return this._reelData;
    }

    public reSize(): void { }
}