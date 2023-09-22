const connect = require('./config/db')
const app = require('./app')
const { gameChannel } = require('./ably')
const moment = require('moment');
const { uuid } = require('short-uuid');
const shortUUID = require('short-uuid');

let coeff = 1;
let slowid;
app.listen(process.env.PORT || 2000, async function () {
    await connect();
    gameChannel.subscribe('end', () => {
        console.log("Game Ended", coeff);
        coeff = 1
        clearInterval(slowid);
        const newRound = shortUUID.uuid().toString();
        gameChannel.publish('accepting_bets', { roundId: newRound })
        
        setTimeout(() => {
            gameChannel.publish('bets_closed', { roundId: newRound }).then(() => {                
                //start();
            }).catch((e) => {
                console.log("Error", e);
            })

        }, 6500);

    })

    start();

});


/* function start() {
    coeff = 1;
    gameChannel.publish("reset", { unix: moment().unix() });
    gameChannel.publish("start", { unix: moment().unix() })
    let max = Math.floor(0 + Math.random() * 10.20);
    console.log("Max", max);

    gameChannel.subscribe("max", (event) => {
        console.log("max", event);
        max = event.data.max;
    });


    slowid = setInterval(() => {

        if (coeff >= 1 && coeff <= 2) {

            coeff += 0.009;

        }
        if (coeff > 2 && coeff < 3) {
            coeff += 0.019;
        }
        else if (coeff > 3 && coeff < 5) {
            coeff += 0.0239;
        }
        else if (coeff > 5 && coeff < 10) {
            coeff += 0.0399;

        }
        else if (coeff > 10 && coeff < 50) {
            coeff += 0.299;

        }
        else if (coeff > 50 && coeff < 100) {
            coeff += 0.499;

        }
        else if (coeff > 100 && coeff < 1000000) {
            coeff += 0.499;

        }


        if (coeff >= max) {

            gameChannel.publish("end", { coeff: Number(coeff.toFixed(2)) });
            clearInterval(slowid);

            coeff = 1;
        } else {
            gameChannel.publish("game", { coeff: Number(coeff.toFixed(2)) });
        }
    }, 200);
} */