import React from 'react';
import gameConnection from '../interface/connection.js';

import { stripColorsAndStyle } from "irc-colors";

export default class GameStatus extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {

        const userNick = gameConnection.getNickname();
        const turn = this.props.turn;

        let appendColor = "";
        if (turn == userNick) {
            console.log(userNick, turn);
            appendColor = " yourturn"
        }

        return (
            <div className={"game-stats" + appendColor} >
                <input type="submit" name="submit" id="submit" value="DRAW" onClick={() => this.props.sendString("draw")} />
                <input type="submit" name="submit" id="submit" value="PASS" onClick={() => this.props.sendString("pass")} />
                <input type="submit" name="submit" id="submit" value="CHECK" onClick={() => this.props.sendString("turn")} />
                <br />
                Whos Turn: {this.props.turn}<br />
                Game State: {this.props.status}<br />
                <select className="user-list" multiple>
                    {this.props.players && Object.keys(this.props.players)
                        .map(nick => {
                            const playerData = this.props.players[nick]

                            return (<option value={nick}>{nick}</option>);
                        })}
                </select>
            </div>
        );
    }

}
