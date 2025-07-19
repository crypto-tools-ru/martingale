function orderByDescending(array, get) {
    array.sort((a, b) => get(b) - get(a))
}

function distinct(array, get) {
    const result = []

    for (let i = 0; i < array.length; i++) {
        if (result.find(x => get(x) === get(array[i]))) {
            continue
        }

        result.push(array[i])
    }

    return result
}

function sum(array, get) {
    let result = 0

    for (let i = 0; i < array.length; i++) {
        result += get(array[i])
    }

    return result
}

function min(array, get) {
    let result = get(array[0])

    for (let i = 1; i < array.length; i++) {
        if (get(array[i]) < result) {
            result = get(array[i])
        }
    }

    return result
}

function max(array, get) {
    let result = get(array[0])

    for (let i = 1; i < array.length; i++) {
        if (get(array[i]) > result) {
            result = get(array[i])
        }
    }

    return result
}