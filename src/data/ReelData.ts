import { SymbolData } from "./SymbolData";
export class ReelData {
    public id: number;
    public spinSymbolQueue: SymbolData[] = [];
    public stopSymbolQueue: SymbolData[] = [];
    public stopSymbolIdList: number[] = [];
    public bottomPositionY: number = 0;

    private queueIndex: number = -1;

    constructor(id: number) {
        this.id = id;
    }

    public getNextSpinSymbol(): SymbolData {
        this.queueIndex = (this.queueIndex + 1) % this.spinSymbolQueue.length;
        return this.spinSymbolQueue[this.queueIndex];
    }

    public getNextStopSymbol(): SymbolData | undefined {
        return this.stopSymbolQueue.pop();
    }

    public resetQueue(): void {
        this.queueIndex = -1;
    }
}