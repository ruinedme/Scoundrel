const { createInterface } = require('readline');
const TUI = require('./tui');
const Deck = require('./deck');

const deck = new Deck(Math.random() * (2**32), ['JH', 'QH', 'KH', 'AH', 'JD', 'QD', 'KD', 'AD']);
const tui = new TUI();
let life = 20;
let fledLastRoom = false;
let hasConsumedPotion = false;
let weapon = [];
let room = [];
let discard = [];
const cardRE = /^(\d{1,2}|[AJQK])([HDCS])$/;

const menu = () => {
    for (let i = 0; i < room.length; i++) {
        console.log(`${i + 1}: ${room[i]}`);
    }
    if (!fledLastRoom && room.length === 4) {
        console.log('r: Run');
    }
    console.log('q: Quit');
    console.log('weapon: ', weapon, `, life: ${life}, deck: ${deck.remaining()}, discard: ${discard.length}`);
};

const fillRoom = (hasFled = false) => {
    while (room.length < 4) {
        room.push(deck.draw());
    }
    if (!hasFled) fledLastRoom = false;
    hasConsumedPotion = false;
};

const score = () => {
    if (life <= 0){
        life = 0;
        while(deck.remaining() > 0){
            let card = deck.draw();
            if (/[CS]$/.test(card)){
                life -= 1;
            }
        }
    } else if(life === 20 && discard.length > 0){
        let last = discard[discard.length-1];
        if (last.endsWith('H')){
            let value = parseInt(cardRE.exec(last)[1]);
            life += value;
        }
    }

    return life;
};

const playCard = (index) => {
    const card = room[index - 1];
    parsedCard = cardRE.exec(card);
    const kind = parsedCard[2];
    let value = parsedCard[1];
    switch (value) {
        case 'A':
            value = 14;
            break;
        case 'J':
            value = 11
            break;
        case 'Q':
            value = 12
            break;
        case 'K':
            value = 13;
            break;
        default:
            value = parseInt(value,10);
    }
    switch (kind) {
        case 'D':
            discard = discard.concat(weapon);
            weapon.length = 0;
            weapon.push(card);
            break;
        case 'H':
            if (!hasConsumedPotion) {
                hasConsumedPotion = true;
                life += value;
                if (life > 20) life = 20;
            }
            discard.push(card);
            break;
        case 'S':
        case 'C':
            if (weapon.length === 0) {
                life -= value;
                discard.push(card);
            } else if (weapon.length === 1) {
                const wv = parseInt(cardRE.exec(weapon[0])[1], 10);
                const damage = value - wv;

                if (damage > 0) {
                    life -= damage;
                    discard.push(card);
                }
                weapon.push(card);
            } else {
                const mv = parseInt(cardRE.exec(weapon[weapon.length - 1])[1], 10);
                if (mv <= value) {
                    life -= value;
                } else {
                    const wv = parseInt(cardRE.exec(weapon[0])[1], 10);
                    const damage = value - wv;
                    if (damage > 0) {
                        life -= damage;
                        discard.push(card);
                    }
                    weapon.push(card);
                }
            }
            break;
        default:
            throw new Error('Invalid Card ', card);
    }
    room = room.filter(x => x !== card);
};

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'CHOICE> ',
});

fillRoom();
tui.menu({
    life,
    deck,
    room,
    fledLastRoom,
    discard,
    weapon
});

rl.on('line', (line) => {
    switch (line.trim().toLowerCase()) {
        case '1':
        case '2':
        case '3':
        case '4':
            const index = parseInt(line.trim(), 10);
            if (index > room.length) {
                console.log('Invalid Choice');
                break;
            }
            playCard(index);
            break;
        case 'r':
            if (fledLastRoom) {
                console.log('Can\'t flee from 2 rooms in a row.');
                break;
            }
            fledLastRoom = true;
            deck.toBottom(room, true);
            fillRoom(true);
            break;
        case 'q':
        case 'quit':
            life = 0;
            rl.close();
        default:
            console.log('Invalid choice');
    }
    if (life <= 0 || (deck.remaining() === 0 && room.length === 0)){
        rl.close();
    }
    if (room.length === 1) {
        fillRoom();
    }
    tui.menu({
        life,
        deck,
        room,
        fledLastRoom,
        discard,
        weapon
    });
    rl.prompt();
}).on('close', () => {
    tui.destroy();
    let s = score();
    console.log(`FINAL SCORE: ${s}`);
    process.exit(0);
});
