export function saveState(name, state) {
    setTimeout(() => {
        
        localStorage.setItem(name, JSON.stringify(state));
    }, 0)
}

export function getState(name, defaultState) {
    const state = localStorage.getItem(name);
    if (state) {
        return JSON.parse(state);
    }
    return defaultState;
}