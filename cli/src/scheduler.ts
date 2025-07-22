import Enumerable from "linq"

async function work(action: () => Promise<void>, ...times: number[]) {
    if (!times.length) {
        log("Times not found. Process only once", times)
        await action()
        return
    }

    log("Start process by times", times)

    let lastTime = 0
    const getTime = (hour: number) => {
        const now = new Date()
        return now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + hour
    }

    const check = async () => {
        {
            const now = getTime(new Date().getHours())
            const nextTime = Enumerable.from(times)
                .select(x => getTime(x))
                .singleOrDefault(x => x > lastTime && x === now)

            if (!nextTime) {
                log(
                    "Not found time to work",
                    lastTime,
                    now,
                    Enumerable.from(times).select(x => getTime(x)).toArray()
                )
                return
            }

            log("Execute action", lastTime, now, nextTime)
            lastTime = nextTime
            await action()
        }
    }

    setInterval(() => check(), 5 * 60 * 1000)
    await check()
}

function log(...parameters: any[]) {
    console.log(new Date(), "Scheduler:", ...parameters)
}

export const scheduler = {
    work,
}