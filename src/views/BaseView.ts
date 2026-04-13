interface LayoutObject {
    position: Position;
}
interface Position {
    X: number;
    Y: number;
}
import { Assets, Container, ContainerOptions, Sprite, Ticker } from "pixi.js";

export class BaseView extends Container {

    private _layout;
    private _config;
    public layoutName: string;

    constructor(layoutName: string, options?: ContainerOptions) {
        super(options);
        this.layoutName = layoutName;
        this._layout = Assets.get('layoutData')[this.layoutName];
        this._config = Assets.get('configData')['config'];
    }

    protected initView() {
        this.reSize();
    }

    public reSize() {
        if (this._layout) {
            let posObj = this._layout.position;
            this.position.set(posObj.X, posObj.Y);
        } else {
            this.position.set(0, 0);
        }
    }

    public get layout(): any {
        return this._layout;
    }

    public get config(): any {
        return this._config;
    }

    public tick() {

    }
}
