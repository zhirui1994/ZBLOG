export function isLight (rgb) {
    if (typeof rgb === 'string') {
        rgb = hexToArray(rgb);
    }
    return (rgb[0]*19595 + rgb[1]*38469 + rgb[2]*7472) >> 16 > 255 / 2;
};

export function hexToArray(hexColor) {
    if (
        typeof hexColor === 'string' &&
        (
            hexColor.length === 3 ||
            hexColor.length === 4 ||
            hexColor.length === 6 ||
            hexColor.length === 7
        )
    ) {
        const idx = hexColor.indexOf('#') === 0 ? 1 : 0;
        const array = hexColor.slice(idx).split('');
        if (array.length === 6) {
            return [
                +`0x${array[0]}${array[1]}`,
                +`0x${array[2]}${array[3]}`,
                +`0x${array[4]}${array[5]}`,
            ];
        }  else if (array.length === 3) {
            return [
                +`0x${array[0]}${array[0]}`,
                +`0x${array[1]}${array[1]}`,
                +`0x${array[2]}${array[2]}`,
            ];
        }
    } else {
        return hexColor;
    }
}