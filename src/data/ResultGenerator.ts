import { SymbolData } from "./SymbolData";
import { ReelData } from "./ReelData";
import { MathFunctionUtils } from "../utils/MathFunctionUtils";

export interface WinResult {
    lineId: number;
    positions: number[];
    symbolId: number;
    matchCount: number;
    payout: number;
}


const MATH_STRIPS: number[][] = [
    [2, 1, 0, 3, 2, 1, 0, 3, 4, 7, 3, 1, 5, 5, 0, 4, 5, 6, 3, 2, 1, 0, 8, 2, 1, 0, 8, 2, 7, 0, 4, 6, 6, 4, 7, 1, 0, 8, 2, 7, 0, 4, 6, 6, 4, 7],
    [2, 7, 0, 7, 2, 1, 0, 6, 1, 0, 7, 2, 4, 3, 2, 1, 6, 1, 0, 5, 4, 0, 8, 1, 0, 3, 2, 7, 5, 0, 5, 3, 6, 4, 8, 0, 3, 2, 7, 5, 0, 5, 3, 6, 4, 8],
    [2, 2, 0, 8, 2, 1, 0, 0, 6, 6, 8, 5, 7, 3, 4, 1, 8, 2, 1, 0, 3, 8, 2, 1, 0, 5, 0, 2, 4, 7, 3, 4, 5, 6, 7, 0, 5, 0, 2, 4, 7, 3, 4, 5, 6, 7],
    [2, 9, 4, 8, 2, 1, 0, 8, 0, 2, 1, 7, 3, 8, 0, 2, 6, 4, 1, 3, 7, 0, 1, 5, 6, 2, 7, 4, 0, 5, 2, 3, 6, 4, 5, 6, 2, 7, 4, 0, 5, 2, 3, 6, 4, 5],
    [2, 1, 8, 3, 2, 1, 0, 6, 2, 8, 3, 0, 2, 6, 1, 0, 5, 4, 3, 7, 1, 0, 6, 0, 5, 5, 4, 3, 8, 7, 4, 8, 3, 2, 5, 5, 5, 4, 3, 8, 7, 4, 8, 3, 2, 5],
];

const WIN_STOPS: number[][] = [
    [4, 4, 4, 4, 4],
    [2, 2, 2, 6, 6],
    [3, 3, 3, 3, 3],
];

const CONFIG_LINES: { id: number; positions: number[] }[] = [
    { id: 1, positions: [1, 1, 1, 1, 1] },
    { id: 2, positions: [2, 2, 2, 2, 2] },
    { id: 3, positions: [0, 0, 0, 0, 0] },
];

const SYMBOL_PAYTABLE: Record<number, [number, number][]> = {
    0: [[5, 1.25], [4, 0.5], [3, 0.125]],
    1: [[5, 1.25], [4, 0.5], [3, 0.125]],
    2: [[5, 1.25], [4, 0.5], [3, 0.125]],
    3: [[5, 1.875], [4, 0.625], [3, 0.125]],
    4: [[5, 1.875], [4, 0.625], [3, 0.125]],
    5: [[5, 2.5], [4, 1.0], [3, 0.25]],
    6: [[5, 2.5], [4, 1.0], [3, 0.25]],
    7: [[5, 3.75], [4, 1.25], [3, 0.625]],
    8: [[5, 3.75], [4, 1.25], [3, 0.625]],
    9: [[5, 7.5], [4, 1.875], [3, 0.75]],
    10: [[5, 12.5], [4, 3.75], [3, 1.5]],
};

const VISIBLE_ROWS = 3;
const REEL_COUNT = 5;
export class ResultGenerator {


    public setupSpinQueue(reelData: ReelData): void {
        const strip = MATH_STRIPS[reelData.id];
        const startOffset = MathFunctionUtils.getRandomInRange(0, strip.length - 1);

        reelData.spinSymbolQueue = [
            ...strip.slice(startOffset),
            ...strip.slice(0, startOffset),
        ].map(id => new SymbolData(id, [reelData.id, 0]));

        reelData.resetQueue();
    }


    public setupStopResult(reelData: ReelData, winStopIndices: number[]): number[] {
        const strip = MATH_STRIPS[reelData.id];
        const stopIndex = winStopIndices[reelData.id];

        reelData.stopSymbolIdList = [
            strip[stopIndex - 1],
            ...strip.slice(stopIndex, stopIndex + VISIBLE_ROWS),
        ];

        const queueStart = Math.max(1, stopIndex - 2);
        reelData.stopSymbolQueue = strip
            .slice(queueStart, stopIndex + VISIBLE_ROWS)
            .map((id, i) => new SymbolData(id, [reelData.id, i]))
            .reverse();

        return reelData.stopSymbolIdList.slice(1);
    }


    public pickWinStopIndices(): number[] {
        const pick = MathFunctionUtils.getRandomInRange(0, WIN_STOPS.length - 1);
        console.log(`Win combo picked: WIN_STOPS[${pick}] →`, WIN_STOPS[pick]);
        return WIN_STOPS[pick];
    }


    public calculateWins(visibleGrid: number[][]): WinResult[] {
        const wins: WinResult[] = [];

        for (const line of CONFIG_LINES) {
            const firstSymbol = visibleGrid[0][line.positions[0]];

            let matchCount = 1;
            for (let r = 1; r < REEL_COUNT; r++) {
                if (visibleGrid[r][line.positions[r]] === firstSymbol) {
                    matchCount++;
                } else {
                    break;
                }
            }

            if (matchCount < 3) continue;

            const payTable = SYMBOL_PAYTABLE[firstSymbol] ?? [];
            const payEntry = payTable.find(([count]) => count === matchCount);
            const payout = payEntry ? payEntry[1] : 0;

            if (payout > 0) {
                wins.push({ lineId: line.id, positions: line.positions, symbolId: firstSymbol, matchCount, payout });
            }
        }

        return wins;
    }
}