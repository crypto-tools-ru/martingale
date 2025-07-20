async function forEach<T>(items: T[], action: (item: T) => Promise<void>) {
    for (let i = 0; i < items.length; i++) {
        await action(items[i])
    }
}

export const linq = {
    forEach,
}