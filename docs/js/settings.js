function getSettings() {
    return {
        symbol: document.getElementById("symbol").value + "USDT",
        direction: document.getElementById("direction").value,
        startDate: Date.parse(document.getElementById("startDate").value),
        endDate: Date.parse(document.getElementById("endDate").value),
        budget: parseInt(document.getElementById("budget").value),
        count: parseInt(document.getElementById("count").value),
        margin: parseFloat(document.getElementById("margin").value),
        multiplier: parseFloat(document.getElementById("multiplier").value),
        sellProfit: parseInt(document.getElementById("sellProfit").value),
        buyFall: parseInt(document.getElementById("buyFall").value),
    }
}