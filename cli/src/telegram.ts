import fetch from "node-fetch"
import { Settings } from "./settings"

interface Config {
    tgBotToken: string,
    tgChatId: string,
}

let config: Config | null = null

function init(settings: Settings) {
    config = {
        tgBotToken: settings.tgBotToken,
        tgChatId: settings.tgChatId,
    }
}

async function sendMessage(message: string) {
    const line = `\#altcoinIndex ${formatDate(new Date())}\n${message}`

    await fetch(`https://api.telegram.org/bot${config!.tgBotToken}/sendMessage?chat_id=${config!.tgChatId}&text=${encodeURIComponent(line)}`)
}

function formatDate(date: Date): string {
    const format = (value: number): string => {
        return value < 10 ? `0${value}` : value.toString()
    }

    return `${format(date.getDate())}.${format(date.getMonth() + 1)}.${format(date.getFullYear())} ${format(date.getHours())}:${format(date.getMinutes())}:${format(date.getSeconds())}`
}

export const telegram = {
    init,
    sendMessage,
}