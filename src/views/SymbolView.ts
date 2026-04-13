import { AnimatedSprite, BlurFilter, Container, ContainerOptions, Graphics, Sprite, Texture, Ticker } from "pixi.js";
import { createImage, createShape } from "../utils/create-utils";
import { BaseView } from "./BaseView";
import { SymbolData } from "../data/SymbolData";


export class SymbolView extends BaseView {

    private bgSprite!: Sprite | null;
    private symbolFrame!: string;
    private bgShape: Graphics | null;
    private cont: Container | null;
    public cellSize;
    private initialized: boolean = false;
    private _data: SymbolData;
    private isWin = false;

    constructor(symbolFrame: string, layout: string, options?: ContainerOptions) {
        super(layout, options);
        this.cellSize = this.config.slot.cellSize;
        this.symbolFrame = symbolFrame;
        this.initView();
    }

    protected initView() {
        this.destroy();
        this.bgShape = createShape(0, 0, this.cellSize[0], this.cellSize[1], '0xA8DDF0', 1);
        this.bgShape.position.set(this.cellSize[0] * 0.5, this.cellSize[1] * 0.5);
        this.cont = new Container();
        this.cont.addChild(this.bgShape!);
        this.bgSprite = createImage(this.symbolFrame);
        if (this.bgSprite) {
            this.cont.addChild(this.bgSprite);
            this.bgSprite.anchor.set(0.5, 0.5);
            this.bgSprite.position.set(this.cellSize[0] * 0.5, this.cellSize[1] * 0.5);
        }
        this.addChild(this.cont);
    }

    public destroy() {
        this.removeChildren();
        this.bgShape = null;
        this.cont = null;
        this.bgSprite = null;
    }

    public initialize(symbolData: SymbolData, isWin?: boolean): void {
        this._data = new SymbolData(symbolData.id, symbolData.cell);
        this.symbolFrame = `${this.config.slot.symbols[this._data.id].class}`;
        if (!this.initialized) {
            this.initialized = true;
            if (this.bgSprite) {
                this.bgSprite.anchor.set(0.5, 0.5);
                this.bgSprite.position.set(this.cellSize[0] * 0.5, this.cellSize[1] * 0.5);
            }
        }

        this.initView();
        if (!this.bgSprite) return;
        this.bgSprite.visible = true;
        this.bgSprite.alpha = 1;
    }

    public showWin() {
        this.symbolFrame = this.symbolFrame.split('.')[0] + '_connect.png';
        console.log(`Show win for ${this._data.id}, position ${this._data.cell}`)
        this.isWin = true;
        this.initView();
    }

    public resetWin() {
        if (!this.isWin || (this.symbolFrame.indexOf("_") === -1) )
            return;
        this.symbolFrame = this.symbolFrame.split('_connect.png')[0] + '.png';
        this.initView();
    }

    public get data() {
        return this._data;
    }


    public move(x: number, y: number): void {
        this.position.set(x, y);
    }

}
