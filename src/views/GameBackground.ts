import { AnimatedSprite, BlurFilter, Container, ContainerOptions, Graphics, Sprite, Texture, Ticker } from "pixi.js";
import { createImage, createShape } from "../utils/create-utils";
import { BaseView } from "./BaseView";

export class GameBackground extends BaseView {

    private bgSprite!: Sprite | null;
    private bgShape: Graphics | undefined;
    private cont: Container | undefined;

    constructor(layout: string, options?: ContainerOptions) {
        super(layout, options);
        this.initView();
    }

    protected initView() {
        this.bgShape = createShape(0, 0, 1270, 720, '0xF54927', 0.5);
        this.cont = new Container();
        this.cont.addChild(this.bgShape!);
        this.bgSprite = createImage('background.png');
        if (this.bgSprite) {
            this.bgSprite.anchor.set(0.5, 0.5);
            this.cont.addChild(this.bgSprite);
        }
        this.addChild(this.cont);
    }
}
