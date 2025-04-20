const {Mulberry32} = require('../rng');

const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const cardTypes = ['H','D','C','S'];

class Deck {
    #cards = [];
    /**
     * Function that generates a random number between 0 and 1
     */
    #nextRand = ()=>{};
    /**
     * Generates a deck of cards and is shuffled between 1 and 100 times on initialization
     * @param {number} seed 
     * @param {string[]} exclude Cards to exclude from deck generation
     */
    constructor(seed, exclude){
        this.#nextRand = Mulberry32(seed);
        for(const t of cardTypes){
            for(const v of values){
                const c = `${v}${t}`;
                if (!exclude.includes(c)){
                    this.#cards.push(`${v}${t}`);
                }
            }
        }

        this.shuffle(1+(this.#nextRand() * 99)|0);
    }

    /**
     * Shuffle the deck, default is 1 time;
     * @see {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm}
     * @param {number} times 
     */
    shuffle(times = 1){
        for (let s = 0; s< times;s++){
            this.#shuffle(this.#cards);
        }
    }

    #shuffle (array){
        for(let i = array.length - 1; i > 0; i--){
            let j = Math.floor(this.#nextRand() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    /**
     * Draw a card from the deck
     * @returns {string}
     */
    draw = () => this.#cards.pop();

    /**
     * 
     * @returns {number} The remaining number of cards in the deck
     */
    remaining = () => this.#cards.length;

    /**
     * Put given cards back onto the bottom of the deck, optionally shuffle the order they are put
     * @param {string[]} cards 
     * @param {boolean} shuffle Default false
     */
    toBottom(cards, shuffle = false){
        if (cards.length === 0) return;
        if (shuffle && cards.length > 1){
            this.#shuffle(cards);
        }
        while (cards.length > 0){
            this.#cards.unshift(cards.pop());
        }
    }
}

module.exports = Deck;
