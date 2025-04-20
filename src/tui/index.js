const { VT100, SGR, DECSET, CHARSET } = require('@ruinedme/vt100');

/**
 * Text User Interface (TUI)
 */
class TUI {
    #height = 0;
    #width = 0;
    /** @type {VT100} */
    #vt100;

    /**
     * 
     * @param {number} height Default 25
     * @param {number} width Default 80
     */
    constructor(height = 25, width = 80) {
        this.#height = height
        this.#width = width;
        this.#vt100 = new VT100();
        this.#vt100.DECSET(DECSET.USE_ALT_BUFFER).CUP(25,80).write('@');
    }

    getHeight = () => this.#height;
    getWidth = () => this.#width;

    /**
     * 
     * @param {{life: number, deck: Deck,room: string[], fledLastRoom: boolean, discard: string[],weapon: string[], seed: number, err: string}} gameState 
     */
    menu(gameState) {
        
        this.#vt100
            .SU(this.#height)
            .CUP(1, 1)
            .SGR([SGR.FOREGROUND_GREEN, SGR.BOLD])
            .write(`LIFE: ${gameState.life}`, true);
        this.#vt100
            .SGR([SGR.FOREGROUND_CYAN, SGR.BOLD])
            .write(`\tDECK: ${gameState.deck.remaining()}\tDISCARD: ${gameState.discard.length}`, true);

        this.#vt100.CUP(2,0).CHARST(CHARSET.LINE);
        for (let i = 0;i<this.#width;i++){
            this.#vt100.append('o');
        }
        this.#vt100.CHARST(CHARSET.US_ASCII).write();
        for (let i = 0; i < gameState.room.length; i++) {
            this.#vt100
                .CUP(3 + i, 0)
                .SGR([SGR.BOLD])
                .append(`${i + 1}: `);
            const card = gameState.room[i];
            const kind = card[card.length - 1];
            switch (kind) {
                case 'H':
                    this.#vt100.SGR([SGR.FOREGROUND_GREEN]).append('(Heal) ');
                    break;
                case 'D':
                    this.#vt100.SGR([SGR.FOREGROUND_YELLOW]).append('(Equip) ');
                    break;
                case 'S':
                case 'C':
                    this.#vt100.SGR([SGR.FOREGROUND_RED]).append('(Fight) ');
                    break;
            }
            this.#vt100.write(`${gameState.room[i]}`, true);
        }

        if (!gameState.fledLastRoom && gameState.room.length === 4) {
            this.#vt100.CUP(7, 0).SGR([SGR.BOLD]).write('r: RUN', true);
        }

        this.#vt100.CUP(10, 0);
        if (gameState.weapon.length === 0) {
            this.#vt100.write(`WEAPON: [Bare Handed]`);
        } else if (gameState.weapon.length > 1) {
            this.#vt100.write(`WEAPON: ${gameState.weapon[0]}\tLAST MONSTER SLAIN: ${gameState.weapon[gameState.weapon.length - 1]}`);
        } else {
            this.#vt100.write(`WEAPON: ${gameState.weapon[0]}`);
        }

        this.#vt100
            .CUP(this.#height-2, 0)
            .append(`q: QUIT`)
            .CUP(this.#height-2, this.#width - 20)
            .write(`SEED: ${gameState.seed}\r\n`,true);
        if(gameState.err){
            this.#vt100.CUP(this.#height-1,0).SGR([SGR.FOREGROUND_RED,SGR.BOLD]).write(`ERROR: ${gameState.err}`,true);
        }
        this.#vt100.CUP(this.#height, 0).write('CHOICE> ');
    }

    destroy() {
        this.#vt100.SU(this.#height).DECRST(DECSET.USE_ALT_BUFFER).write();
    }
}

module.exports = TUI;
