async function martingale() {
    try {
        setAttribute("show-martingale", "disabled", "")
        setStyle("martingale-loader", "display", "block")

        await showMartingale()
    } catch (ex) {
        console.error(ex)
    }

    removeAttribute("show-martingale", "disabled")
    setStyle("martingale-loader", "display", "none")
}

async function showMartingale() {
    setHtml("martingale-total", "")
    setHtml("martingale-result", "")

    const settings = getSettings()

    const results = await calculateMartingale(
        settings.symbol,
        settings.startDate,
        settings.endDate,
        settings.budget,
        settings.count,
        settings.margin,
        settings.multiplier,
        settings.sellProfit,
        settings.buyFall,
        settings.direction
    )

    showMartingaleTotal(results.total)
    showMartingaleResult(results.results)
}

function showMartingaleTotal(total) {
    let html = ""

    const getRow = (title, value, postfix) => {
        return `
        <div class="row">
            <div class="col-md-3">${title}</div>
            <div class="col-md-9"><b>${value}${postfix || ""}</b></div>
        </div>
    `
    }

    html += getRow("Профит", total.profit, "$")
    html += getRow("Максимальная просадка", total.maxFall, "%")
    html += getRow("Кол-во циклов", total.tradesCount)
    html += getRow("Ориентировочный бюджет", total.needTotalBudget, "$")
    html += getRow("ROI", total.percent, "%")

    setHtml("martingale-total", html)
}

function showMartingaleResult(results) {
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Цена</th>
                    <th>Позиция</th>
                    <th>Количество</th>
                    <th>Средняя цена</th>
                    <th>Просадка</th>
                    <th>Прибыль</th>
                </tr>
            </thead>
            <tbody>
    `

    results.forEach(x => html += `
        <tr>
            <td>${x.date}</th>
            <td>${x.price}$</td>
            <td>${x.money}$</td>
            <td>${x.coins}</td>
            <td>${x.avgPrice}$</td>
            <td>${x.fall}%</td>
            <td>${x.profit}$</td>
        </tr>
    `)

    html += `
                </tbody>
            </table>
        `
    setHtml("martingale-result", html)
}