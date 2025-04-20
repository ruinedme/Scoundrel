/**
 * @see {@link https://gist.github.com/tommyettinger/46a874533244883189143505d203312c}
 * @param {number} seed 
 * @returns 
 */
const Mulberry32 = (seed) => {
    return () => {
        seed = (seed + 0x9e3779b9) | 0;
        let z = seed;
        z ^= z >>> 16;
        z = Math.imul(z, 0x21f0aaad);
        z ^= z >>> 15;
        z = Math.imul(z, 0x735a2d97);
        z ^= z >>> 15;
        return (z >>> 0) / 0x100000000; // return a positive number between 0 and 1
    };
}

module.exports = {
    Mulberry32,
}
