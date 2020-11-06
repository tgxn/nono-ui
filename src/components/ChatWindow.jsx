import React from 'react';
import gameConnection from '../interface/connection.js';

import { stripColorsAndStyle } from "irc-colors";

export default class ChatWindow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inChannel: false,
            message: "uno",
            messages: [],
        };

        /**
         * ChatListener 
         * 
         * Recieves events for:
         * - notice (unobot)
         * - privmsg (unobot)
         */
        gameConnection.setListener("chat", ({ type, parsedMessage, }) => {
            console.log("got chatMessage", type, parsedMessage);

            if (type == "joined") {
                this.setState({
                    ...this.state,
                    inChannel: true,
                    messages: [
                        ...this.state.messages,
                        parsedMessage
                    ],
                });
            }

            else if (type == "message" || type == "notice" || type == "404") {
                this.setState({
                    ...this.state,
                    messages: [
                        ...this.state.messages,
                        parsedMessage
                    ]
                });
            }

        });
    }

    sendInput() {
        const inputMessage = this.state.message;
        console.log("inputMessage", inputMessage);

        this.sendString(inputMessage);

        this.setState({ message: "", });
    }

    sendString(stringToSend) {
        console.log("sendString", stringToSend);


        const userNick = gameConnection.getNickname();
        console.log("userNick", userNick);

        const ourSide = {
            prefix: userNick + "!fake",
            params: [
                "",
                stringToSend
            ],
        };
        console.log("ourSide", ourSide);
        this.setState({
            ...this.state,
            messages: [
                ...this.state.messages,
                ourSide
            ]
        });

        gameConnection.sendChannel(stringToSend);
    }

    componentDidUpdate() {
        var el = this.refs.output;
        el.scrollTop = el.scrollHeight;
    }

    messageItems() {
        return this.state.messages.map(message => {
            // {
            //     "raw": ":nono_bot_716!websocket@52789176.9116A563.73DB4363.IP JOIN :#Uno",
            //     "prefix": "nono_bot_716!websocket@52789176.9116A563.73DB4363.IP",
            //     "command": "JOIN",
            //     "params": [
            //       "#Uno"
            //     ]
            //   }

            if (message.command == "JOIN") {
                return <p> <strong>{message.prefix.split("!")[0]}</strong> has joined {message.params[0]}!</p>;

            }
            // {
            //     "raw": ":irc.connct.online 404 nono_bot_980 #Uno :You need voice (+v) (#Uno)",
            //     "prefix": "irc.connct.online",
            //     "command": "404",
            //     "params": [
            //       "nono_bot_980",
            //       "#Uno",
            //       "You need voice (+v) (#Uno)"
            //     ]
            //   }
            if (message.command == "404") {
                return <p> <strong>{message.params[1]}</strong>: {message.params[2]}</p>;

            }




            return <p><strong>{message.prefix.split("!")[0]}</strong>: {stripColorsAndStyle(message.params[1])}</p>;
        })
    }

    render() {
        console.log(this.state.messages);


        return (
            <div id="chatwindow">

                <input type="submit" name="submit" id="submit" value="NEW GAME" onClick={() => this.sendString("uno")} />
                <input type="submit" name="submit" id="submit" value="JOIN GAME" onClick={() => this.sendString("join")} />
                <input type="submit" name="submit" id="submit" value="START GAME" onClick={() => this.sendString("deal")} />

                Nick: {gameConnection.getNickname()}

                <div id="output" ref='output' className="output">{!this.state.inChannel ? "not in channel!" : this.messageItems()}</div>

                <input type="text" name="input" id="input" size="60" value={this.state.message}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            this.sendInput();
                        }
                    }}
                    onChange={event => this.setState({ message: event.target.value, })} />

                <input type="submit" name="submit" id="submit" value="Send" disabled={this.state.message == ""} onClick={() => this.sendInput()} />


            </div>
        );
    }

}
