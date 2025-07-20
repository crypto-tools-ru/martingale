require("dotenv").config()

export interface Symbol {
    symbol: string,
    start: number,
}

export interface Settings {
    strategy: string,

    symbols: Symbol[],

    trackPriceStartDate: number,
    trackPriceIntervalHours: number,

    bybitApiKeyPublic: string,
    bybitApiKeyPrivate: string,
    tgBotToken: string,
    tgChatId: string,
}

function get(): Settings {
    return {
        strategy: process.env.strategy!,

        symbols: process.env.symbols!
            .split(";")
            .map(x => x.split(","))
            .map(x => ({
                symbol: x[0] + "USDT",
                start: Date.parse(x[1]),
            })),

        trackPriceStartDate: Date.parse(process.env.trackPriceStartDate!),
        trackPriceIntervalHours: parseInt(process.env.trackPriceIntervalHours!),

        bybitApiKeyPublic: process.env.bybitApiKeyPublic!,
        bybitApiKeyPrivate: process.env.bybitApiKeyPrivate!,
        tgBotToken: process.env.tgBotToken!,
        tgChatId: process.env.tgChatId!,
    }
}

export const settings = {
    get,
}