const category = "spot"

async function getSymbolInfo(symbol) {
    const response = await fetch(`https://api.bybit.com/v5/market/instruments-info?category=${category}`
        + `&symbol=${symbol}`
        + "&limit=1000"
    )

    const json = await ensureResponseOkAndGetJson(response)

    return json.result.list.map(x => ({
        symbol: x.symbol,
        countStep: parseFloat(x.lotSizeFilter.basePrecision),
        priceStep: parseFloat(x.priceFilter.tickSize),
    }))[0]
}

async function getCandles(symbol, interval, start, end) {
    const limit = 1000
    const maxPages = 300

    const get = async (date) => {
        const response = await fetch(`https://api.bybit.com/v5/market/kline?category=${category}`
            + `&symbol=${symbol}`
            + `&interval=${interval}`
            + `&start=${date}`
            + `&end=${end}`
            + `&limit=${limit}`
        )

        const json = await ensureResponseOkAndGetJson(response)

        return json.result.list.map(x => ({
            symbol,
            date: parseInt(x[0]),
            close: parseFloat(x[4]),
            low: parseFloat(x[3]),
        }))
    }

    let candles = []
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

    candles = distinct(candles, x => x.date)
    orderByDescending(candles, x => x.date)

    return candles
}

async function ensureResponseOkAndGetJson(response) {
    if (!response.ok) {
        console.error(response)
        throw new Error(`Bybit response error. Code ${response.Error}`)
    }

    const json = await response.json()

    if (json.retCode !== 0) {
        console.log(json)
        throw new Error(`Bybit response error. Code ${json.retCode}. Message ${json.retMsg}`)
    }

    return json
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}