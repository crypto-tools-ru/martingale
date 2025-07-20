import Enumerable from "linq";
import { bybit } from "./bybit";
import { linq } from "./linq";
import { Symbol } from "./settings";

interface Profit {
    symbol: string,
    profit: number,
}

interface Profits {
    profits: Profit[],
    profit: number,
}

async function calculateProfits(symbols: Symbol[]): Promise<Profits> {
    console.log(new Date(), "Start calculate profits")

    const assets = await bybit.getAssets()
    let profits: Profit[] = []

    await linq.forEach(symbols, async ({ symbol, start }) => {
        const coins = assets.find(x => x.symbol === symbol)?.size || 0
        if (!coins) {
            console.log(`Assets not found for ${symbol}. Skip calculate profit`)
        }

        const trades = await bybit.getTrades(start)
        const price = await bybit.getPrice(symbol)

        const money = Enumerable.from(trades).sum(x => x.money)
        const avgPrice = money / coins
        const profit = round((price - avgPrice) / avgPrice * 100)

        profits.push({ symbol, profit })
    })

    profits = Enumerable.from(profits).orderByDescending(x => x.profit).toArray()
    const profit = round(Enumerable.from(profits).average(x => x.profit))

    return { profits, profit }
}

function round(value: number): number {
    return parseFloat(value.toFixed(2))
}

export const pricesCalculator = {
    calculateProfits,
}