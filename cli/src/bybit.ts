import { APIResponseV3WithTime, KlineIntervalV3, RestClientV5 } from "bybit-api"
import Enumerable from "linq"
import { Settings } from "./settings"

export interface Candle {
    symbol: string,
    date: number,
    close: number,
}

export interface Asset {
    symbol: string,
    size: number,
}

interface Trade {
    symbol: string,
    money: number,
}

const category = "spot"
const hourMs = 60 * 60 * 1000

let client: RestClientV5 | null = null

function init(settings: Settings) {
    client = new RestClientV5({
        key: settings.bybitApiKeyPublic,
        secret: settings.bybitApiKeyPrivate,
        recv_window: 100000000,
        baseUrl: "https://api.bybit.com",
    })
}

async function getPrice(symbol: string) {
    const start = new Date().getTime() - hourMs
    const end = new Date().getTime()
    return (await getCandles(symbol, "1", start, end))[0].close
}

async function getCandles(symbol: string, interval: KlineIntervalV3, start: number, end: number): Promise<Candle[]> {
    const limit = 1000
    const maxPages = 300

    const get = async (date: number): Promise<Candle[]> => {
        const response = await client!.getKline({
            category,
            symbol,
            interval,
            start: date,
            end,
            limit,
        })

        ensureResponseOk(response)

        return response.result.list.map(x => ({
            symbol,
            date: parseInt(x[0]),
            close: parseFloat(x[4]),
        }))
    }

    let candles: Candle[] = []
    let date = start

    for (let i = 0; i < maxPages; i++) {
        const newCandles = await get(date)
        if (!newCandles.length) {
            break
        }

        candles = [...candles, ...newCandles]
        date = newCandles[0].date + 1

        if (newCandles.length !== limit) {
            break
        }

        await sleep(100)
    }

    return Enumerable.from(candles)
        .distinct(x => x.date)
        .orderByDescending(x => x.date)
        .toArray()
}

async function getAssets(): Promise<Asset[]> {
    const response = await client!.getWalletBalance({
        accountType: "UNIFIED",
    })

    ensureResponseOk(response)

    return response
        .result
        .list[0]
        .coin
        .filter(x => x.coin !== "USDT")
        .map(x => ({
            symbol: `${x.coin}USDT`,
            size: parseFloat(x.walletBalance),
        }))
}

async function getTrades(start: number): Promise<Trade[]> {
    var response = await client!.getExecutionList({
        category,
        startTime: start,
    })

    ensureResponseOk(response)

    return response
        .result
        .list
        .map(x => ({
            symbol: x.symbol,
            money: parseFloat(x.execValue),
        }))
}

function ensureResponseOk<T>(response: APIResponseV3WithTime<T>) {
    if (response.retCode !== 0) {
        console.log(response)
        throw new Error(`Bybit response error. Code ${response.retCode}. Message ${response.retMsg}`)
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const bybit = {
    init,
    getPrice,
    getAssets,
    getTrades,
}