import React from 'react';
import gameConnection from '../interface/connection.js';


import GameStatus from "./GameStatus.jsx"

import { stripColorsAndStyle } from "irc-colors";

export default class MainGame extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            status: "stopped",
            turn: false,
            players: [],
            hand: [],
            top: false,
        };

        /**
         * GameListener 
         * 
         * Recieves events for:
         * - notice (unobot)
         * - privmsg (unobot)
         */
        gameConnection.setListener("game", ({ type, parsedMessage, }) => {
            console.log("got gameMessage", type, parsedMessage);

            if (type == "notice") {

                console.warn("NOTICE", parsedMessage);
                const msg = parsedMessage.params[1];

                if (msg == "No game in progress.") {
                    console.log("no game in progress", parsedMessage);
                    this.setState({
                        status: "stopped",
                    });
                }

                // hand notice "Hand: \u000300,04r9\u000f \u000300,01wd4\u000f \u000300,03gs\u000f \u000300,01w\u000f \u000300,03g5\u000f \u000300,03g7\u000f \u000300,12bd2\u000f "
                if (msg.startsWith("Hand: ")) {

                    // stript crap, extrat cards
                    const handFull = msg.substr(6).trim();
                    const handFlat = stripColorsAndStyle(handFull);

                    console.warn("hand", handFlat);
                    const cardsArray = handFlat.split(" ");

                    this.setState({
                        ...this.state,
                        hand: cardsArray,
                    });

                }

            }

            if (type == "botmsg") {

                console.warn("BOT_MSG", parsedMessage);
                const msg = parsedMessage.params[1];

                //////////////// GAME STATE

                if (msg.indexOf(" stopped the current game.") !== -1) {

                    console.log("game started", parsedMessage);
                    this.setState({
                        status: "stopped",
                    });
                }

                if (msg == "A game of Uno has started. Players can now \"join\".") {
                    console.log("game started", parsedMessage);
                    this.setState({
                        status: "lobby",
                    });
                }

                if (msg.indexOf(" has won the game!") !== -1) {
                    console.log("game FINISHED", parsedMessage);
                    this.setState({
                        status: "stopped",
                    });
                }

                if (msg.indexOf(" has joined the game!") !== -1) {
                    console.log("player joined", parsedMessage);
                    const joiningPlayer = msg.replace(" has joined the game!", "");
                    this.setState({
                        players: {
                            ...this.state.players,
                            [joiningPlayer]: parsedMessage.prefix,
                        },
                    });
                }

                //////////////// TOP CARD

                let topCard = false;

                // someone playes "gamerx played \u000300,04r8\u000f."
                if (msg.indexOf(" played ") !== -1) {
                    let cleanInput = msg.split(" played ")[1];
                    cleanInput = cleanInput.substring(0, cleanInput.length - 1)
                    topCard = stripColorsAndStyle(cleanInput);
                }

                // game start "Game Started, Top Card is \u000300,12b0\u000f"
                if (
                    msg.startsWith("Game Started, Top Card is ")
                ) {
                    const cleanInput = msg.replace("Game Started, Top Card is ", "").trim();
                    topCard = stripColorsAndStyle(cleanInput);
                    this.setState({
                        status: "started",
                    });
                }

                if (topCard) {
                    console.warn("top", topCard);
                    this.setState({
                        ...this.state,
                        top: topCard,
                    });
                }

                //////////////// TURN

                let whosTurn = false;

                if (msg.indexOf("'s turn!") !== -1) {
                    whosTurn = msg.replace("'s turn!", "");
                    whosTurn = whosTurn.replace("It's currently ", "");
                }

                if (whosTurn) {
                    console.warn("whosTurn", whosTurn);
                    this.setState({
                        ...this.state,
                        turn: whosTurn,
                    });
                }
            }

        });

    }

    playCard(cardId) {

        let cardCommand = "p " + cardId;

        // select w color
        if (cardId.indexOf("w") == 0) {
            const selectedColor = prompt("please select color, from [b, blue, r, red, g, green, y, yellow]");
            if (selectedColor != null) {
                cardCommand += " " + selectedColor;
                gameConnection.sendChannel(cardCommand);
            }
        }

        else {
            gameConnection.sendChannel(cardCommand);
        }

    }

    sendString(stringToSend) {
        console.log("sendString", stringToSend);

        gameConnection.sendChannel(stringToSend);
    }

    render() {

        let topPath = <img src={`cards/${this.state.top}.png`} />;

        // just color code
        if (this.state.top.length == 1) {
            topPath = this.state.top;
        }

        return (
            <div id="maingame">
                Top Card<br />
                <div className="top">
                    {this.state.top && <div>
                        {topPath}
                    </div>}

                </div>
                <br /><br />
                Your Hand<br />
                <div className="hand">
                    {this.state.hand.map(card => {
                        return <div className="card" onClick={() => this.playCard(card)}>
                            <img src={`cards/${card}.png`} />
                        </div>;
                    })}
                </div>

                <GameStatus
                    sendString={this.sendString}
                    players={this.state.players}
                    status={this.state.status}
                    turn={this.state.turn} />
            </div>
        );
    }

}
