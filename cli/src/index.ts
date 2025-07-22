import { bybit } from "./bybit"
import { pricesCalculator } from "./pricesCalculator"
import { settings as settingsProvider, Settings } from "./settings"
import { telegram } from "./telegram"
import { linq } from "./linq"
import { scheduler } from "./scheduler"

async function trackPrice(settings: Settings) {
    const innerTrackPrice = async () => {
        try {
            const profits = await pricesCalculator.calculateProfits(settings.symbols)

            console.log("*****")
            profits.profits.forEach(x => console.log(x.symbol, "-", "profit:", x.profit, "%,"))

            console.log("*****")
            console.log("Total profit:", profits.profit, "%,")

            await linq.forEach(profits.profits, async profit => {
                await telegram.sendMessage(`${profit.symbol} - current profit ${profit.profit}%`)
            })
        } catch (ex) {
            console.error(ex)
        }
    }

    await scheduler.work(innerTrackPrice, ...settings.trackPriceIntervalHours)
}

async function main() {
    const settings = settingsProvider.get()
    bybit.init(settings)
    telegram.init(settings)

    console.log(new Date(), "Start work", settings.strategy)

    switch (settings.strategy) {
        case "trackPrice": return await trackPrice(settings)
    }
}

main()
