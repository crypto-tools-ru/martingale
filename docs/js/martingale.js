async function calculateMartingale(symbol, start, end, budget, count, margin, multiplier, sellProfit, buyFall, direction) {
    const calculateProfit = direction === "Long"
        ? (end, start) => (end - start) / start
        : (end, start) => (start - end) / start

    const results = []

    const candles = await getCandles(symbol, "D", start, end)
    const symbolInfo = await getSymbolInfo(symbol)
    let addCount = 0

    for (let i = candles.length - 1; i >= 0; i--) {
        const candle = candles[i]

        const canAdd = addCount < count
        const lastResult = results[results.length - 1]

        if (!results.length || !lastResult?.money) {
            results.push(add(candle, 0, 0, budget, multiplier, calculateProfit, symbolInfo))
            addCount++
            continue
        }

        const profit = calculateProfit(candle.close, lastResult.avgPrice) * 100

        if (profit > sellProfit) {
            results.push(close(candle, lastResult, calculateProfit))
            addCount = 0
            continue
        }

        if (profit < buyFall && canAdd) {
            results.push(add(candle, lastResult.money, lastResult.coins, budget, multiplier, calculateProfit, symbolInfo))
            addCount++
            continue
        }

        results.push(notAdd(candle, lastResult, calculateProfit))
    }

    const total = getMartingaleTotal(results, margin)

    return { results, total }
}

function getMartingaleTotal(results, margin) {
    const profit = round(sum(results, x => x.profit))
    const maxFall = round(min(results, x => x.fall))
    const tradesCount = results.filter(x => !!x.profit).length
    const needTotalBudget = round(max(results, x => x.money)) / margin
    const percent = round((profit / needTotalBudget) * 100)

    return {
        profit,
        maxFall,
        tradesCount,
        needTotalBudget,
        percent,
    }
}

function add(candle, lastMoney, lastCoins, budget, multiplier, calculateProfit, symbolInfo) {
    const date = formatDate(candle.date)
    const price = candle.close
    const addMoney = multiplier > 1 ? (!!lastMoney ? lastMoney * (multiplier - 1) : budget) : budget
    const money = round(lastMoney + addMoney)
    const coins = round(lastCoins + addMoney / price, symbolInfo.countStep)
    const avgPrice = round(money / coins, symbolInfo.priceStep)
    const fall = round(calculateProfit(candle.low, avgPrice) * 100)
    const profit = 0

    return { date, price, money, coins, avgPrice, fall, profit }
}

function notAdd(candle, lastResult, calculateProfit) {
    const date = formatDate(candle.date)
    const price = candle.close
    const money = lastResult.money
    const coins = lastResult.coins
    const avgPrice = lastResult.avgPrice
    const fall = !!avgPrice ? round(calculateProfit(candle.low, avgPrice) * 100) : 0
    const profit = 0

    return { date, price, money, coins, avgPrice, fall, profit }
}

function close(candle, lastResult, calculateProfit) {
    const date = formatDate(candle.date)
    const price = candle.close
    const money = 0
    const coins = 0
    const avgPrice = 0
    const fall = 0
    const profit = round(calculateProfit(price, lastResult.avgPrice) * lastResult.money)

    return { date, price, money, coins, avgPrice, fall, profit }
}

function formatDate(time) {
    const date = new Date(time)
    const format = (value) => {
        return value < 10 ? `0${value}` : value.toString()
    }

    return `${format(date.getFullYear())}-${format(date.getMonth() + 1)}-${format(date.getDate())}`
}

function round(value, step = 0.01) {
    return parseFloat(
        (value - value % step).toFixed(10)
    )
}