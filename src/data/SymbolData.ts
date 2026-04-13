export class SymbolData {
    public id: number = -1;
    public cell: number[] = [-1, -1];

    public constructor(id: number, cell: number[]) {
        this.initialize(id, cell)
    }

    public initialize(id: number, cell: number[]): SymbolData {
        this.id = id;
        this.cell = cell;
        return this;
    }
}