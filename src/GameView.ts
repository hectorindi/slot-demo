import { Container, ContainerOptions, Ticker } from "pixi.js";
import { createShape } from "./utils/create-utils";
import { GameBackground } from "./views/GameBackground";
import { PlayButton } from "./views/PlayButton";
import { SlotViews } from './views/SlotViews';
import { Text, TextStyle } from "pixi.js";
import 'fpsmeter';

declare const FPSMeter: any;

export class GameView extends Container {

    private gameBg!: GameBackground;
    private slotView!: SlotViews;
    private playBtn!: PlayButton;
    private balanceText!: Text;
    private winText!: Text;
    protected _fpsMeter!: FPSMeter;
    protected balance: number = 1000;

    constructor(options?: ContainerOptions) {
        super(options);
        this.initView();
        this._fpsMeter = new FPSMeter();
        this._fpsMeter.showFps();
    }

    protected initView() {
        this.createBackgroud();
        this.createSlotView();
        this.createUI();
        Ticker.shared.add(this.tick, this);
    }


    private createBackgroud() {
        this.addChild(createShape(0, 0, 1270, 720, '0x27F587', 1));
        this.gameBg = new GameBackground('gamebg');
        this.addChild(this.gameBg);
    }

    private createUI() {
        this.playBtn = new PlayButton('playBtn', this.handleStart.bind(this));
        this.addChild(this.playBtn);
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 25,
            align: 'center',
            fill: 'white',
            stroke: { color: '#4a1850', width: 1 }
        });

        this.balanceText = new Text({
            text: '',
            style: style
        });

        this.winText = new Text({
            text: 'PRESS SPIN TO WIN',
            style: style
        });
        this.balanceText.anchor.set(0.5, 0.5);
        this.winText.anchor.set(0.5, 0.5);
        this.balanceText.position.set(-500, 330);
        this.winText.position.set(400, 330);
        this.balanceText.text = this.balance;
        this.addChild(this.balanceText);
        this.addChild(this.winText);
    }

    private createSlotView() {
        this.slotView = new SlotViews('slot');
        this.slotView.initView();
        this.addChild(this.slotView);
    }


    public reSize() {
        this.gameBg?.reSize();
        this.slotView?.reSize();
    }

    public tick() {
        this._fpsMeter.tick();
        this.slotView?.tick();
    }

    async handleStart() {
        this.playBtn.setDisabled();
        this.slotView.startSpin();
        this.updateBalance(-10);
        this.winText.text = "GOOD LUCK";

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.slotView.stopSpin();
        this.updateBalance(this.slotView.totalPayout);
        if (this.slotView.totalPayout) {
            this.winText.text = this.slotView.totalPayout;
        } else {
            this.winText.text = "PRESS SPIN TO PLAY";
        }
        this.playBtn.setEnabled();
        console.log("spin complete");
    }

    private updateBalance(amaount: number) {
        this.balance = this.balance + amaount;
        this.balanceText.anchor.set(0.5, 0.5);
        this.winText.anchor.set(0.5, 0.5);
        this.balanceText.position.set(-500, 330);
        this.winText.position.set(400, 330);
        this.balanceText.text = this.balance;
    }
}
