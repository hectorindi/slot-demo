import { ContainerOptions, Graphics, Rectangle, Text, TextStyle } from "pixi.js";
import { BaseView } from "./BaseView";
import { createShape } from "../utils/create-utils";

export class PlayButton extends BaseView {
    private readonly _onClick: () => void;
    private readonly activeShape: Graphics;
    private readonly disabledShape: Graphics;

    constructor(layout: string, onClick: () => void, options?: ContainerOptions) {
        super(layout, options);
        this._onClick = onClick.bind(this);

        this.activeShape   = createShape(0, 0, 100, 30, '0xF54927', 1);
        this.disabledShape = createShape(0, 0, 100, 30, '0xF54927', 0.5);

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 25,
            align: 'center',
            fill: 'white',
            stroke: { color: '#4a1850', width: 1 }
        });
        const playText = new Text({ text: 'Play', style });
        playText.anchor.set(0.5, 0.5);
        playText.position.set(0, 0);

        this.addChild(this.activeShape);
        this.addChild(this.disabledShape);
        this.addChild(playText);

        this.position.set(0, 330);

        
        this.eventMode = 'static';
        this.hitArea = new Rectangle(-50, -15, 100, 30);
        this.cursor = 'pointer';
        this.on('pointerdown', this._onClick);

        this.setEnabled();
    }

    public setEnabled(): void {
        this.eventMode         = 'static';
    this.activeShape.visible   = true;
    this.disabledShape.visible = false;
    }

    public setDisabled(): void {
        this.eventMode         = 'none';    // ← 'none' completely ignores all events in v8
    this.activeShape.visible   = false;
    this.disabledShape.visible = true;
    }

    public reSize(): void { super.reSize(); }
}