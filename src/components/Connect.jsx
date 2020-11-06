import React from 'react';
import gameConnection from '../interface/connection.js';

export default class MainGame extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            nickname: "nono_bot_" + Math.floor((Math.random() * 1000) + 1).toString(),
        };

    }

    render() {
        return (
            <div id="connect">
                <div className="inner">
                    <div className="title">NOno Videographical Game</div>

                    <div className="connection-info">
                        <div>Nickname:</div>
                        <p>
                            <input
                                type="text"
                                name="nickname"
                                id="nickname"
                                value={this.state.nickname}
                                onChange={event => this.setState({ nickname: event.target.value, })} />
                            <button
                                onClick={() => gameConnection.connectWebSocket(this.state.nickname)} >
                                Connect!
                        </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

}
