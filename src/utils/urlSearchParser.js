export function getSearchCode() {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    if (code) {
        searchParams.delete('code');
        const search = searchParams.toString();
        const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
        window.history.pushState(null, null, url)
        return code;
    } else {
        return '';
    }
}

export function isPWA() {
    return window.location.href.indexOf('from=pwa') !== -1;
}