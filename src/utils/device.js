export function isMobile() {
    if (window.navigator.userAgent.match(/(iPhone|iPad|iPod|Android|ios)/)) {
        return true;
    }
    return false;
}