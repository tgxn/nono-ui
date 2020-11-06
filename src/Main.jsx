import React from 'react';
import { Provider } from 'react-redux';

import gameConnection from './interface/connection.js';

import Connect from './components/Connect.jsx';
import MainGame from './components/MainGame.jsx';
import ChatWindow from './components/ChatWindow.jsx';

import store from './store';

import './scss/Main.scss';
export default class Main extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            is_loading: true,
            loading_text: "Loading...",
        }

        gameConnection.setListener("main", (gameMesage) => {
            console.log("got game msg", gameMesage);
            this.setState({
                ...gameMesage,
            });

        });

    }

    render() {

        if (gameConnection.isConnected()) {

            return <>
                <MainGame />
                <ChatWindow />
            </>;

        }

        return (
            <Connect />
        );

    }
}