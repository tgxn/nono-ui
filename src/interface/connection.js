
class Connection {

    constructor() {

        this.connected = false;
        this.websocket = null;

        this.listeners = {};
        this.nickname = "";

        this.server = {
            uri: "wss://irc.connct.online/",
            channelName: "#Uno",
            channelKey: "",
            unoBotHost: "UnoBot!UnoBot@games.connct.online",
        };

    }

    setListener(listenIdent, listenHandler) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, listenIdent)) {
            this.listeners[listenIdent] = {};
        }
        this.listeners[listenIdent] = {
            handler: listenHandler,
        };
        console.log("added listener", listenHandler);
    }

    callListener(listenIdent, eventData) {
        if (Object.prototype.hasOwnProperty.call(this.listeners, listenIdent)) {
            return this.listeners[listenIdent].handler(eventData);
        }
    }

    isConnected() {
        return this.connected;
    }

    getNickname() {
        return this.nickname;
    }

    setConnected(isConnected) {
        this.connected = isConnected;
        this.callListener("main", {
            connected: isConnected,
        });
    }

    doSend(message) {
        if (this.isConnected()) {
            console.info(">>> ", message);
            this.websocket.send(message + "\n");
        } else {
            console.warn("dosend with not connected", message)
        }
    }

    sendChannel(message) {
        this.doSend("privmsg " + this.server.channelName + " :" + message);
    }

    connectWebSocket(nickName) {
        this.nickname = nickName;

        this.websocket = new WebSocket(this.server.uri);

        this.websocket.onopen = (evt) => {
            this.setConnected(true);

            this.doSend("user websocket * * :Online User");
            this.doSend("nick " + this.nickname);
        }

        this.websocket.onclose = (evt) => {
            this.setConnected(false);
        };

        this.websocket.onmessage = (evt) => {
            const rawData = evt.data;
            if (rawData instanceof Blob) { // binary
                var fileReader = new FileReader();
                fileReader.addEventListener("loadend", event => {
                    const fileReader = event.target;
                    this.process(fileReader.result);
                });
                fileReader.readAsText(rawData);
            }
            else { //text
                this.process(rawData);
            }
        };

        this.websocket.onerror = (evt) => {
            this.setConnected(false);

            console.error("wss error!", evt);
        };

    }



    process(rawData) {
        const parsedMessage = this.parseMessage(rawData);
        console.info("<<< ", parsedMessage);

        switch (parsedMessage.command) {

            // respond to IRC PING
            case "PING":
                this.doSend("PONG :" + parsedMessage.params[0]);
                break;

            // IRC connect
            case "001":
                // join channel upon connection (optional key)
                const joinCommand = "JOIN " + this.server.channelName;
                if (this.server.channelKey != "") {
                    joinCommand += " " + this.server.channelKey;
                }
                this.doSend(joinCommand);
                break;

            case "JOIN":
                // if the user joined our channel
                if (parsedMessage.params[0] == this.server.channelName) {
                    this.callListener("chat", {
                        type: "joined",
                        parsedMessage
                    });
                }
                break;

            case "404":
                // if the user joined our channel
                this.callListener("chat", {
                    type: "404",
                    parsedMessage,
                });
                break;

            case "PRIVMSG":
                this.processMessage(parsedMessage);
                break;

            case "NOTICE":
                this.processNotice(parsedMessage);
                break;

        };

    }

    processMessage(parsedMessage) {
        const message = parsedMessage.params[1];

        // only messages in assigned channel
        if (parsedMessage.params[0] == this.server.channelName) {

            this.callListener("chat", {
                type: "message",
                parsedMessage,
            });

            this.callListener("game", {
                type: "botmsg",
                parsedMessage,
            });

        }
    }

    processNotice(parsedMessage) {
        const message = parsedMessage.params[1];

        // notices from nono bot
        if (parsedMessage.prefix.indexOf(this.server.unoBotHost) !== -1) {

            this.callListener("chat", {
                type: "notice",
                parsedMessage,
            });

            this.callListener("game", {
                type: "notice",
                parsedMessage,
            });

        }

    }

    parseMessage(text) {

        var raw = text;

        // prefix
        if (text.charAt(0) === ':') {
            var i = text.indexOf(' ');
            var prefix = text.slice(1, i);
            text = text.slice(i + 1);
        }

        // command
        var i = text.indexOf(' ');
        if (i === -1) i = text.length;
        var command = text.slice(0, i);
        text = text.slice(i + 1);

        var params = [];

        // middle
        while (text && text.charAt(0) !== ':') {
            var i = text.indexOf(' ');
            if (i === -1) i = text.length;
            params.push(text.slice(0, i));
            text = text.slice(i + 1);
        }

        // trailing
        if (text) params.push(text.slice(1));

        return {
            raw: raw,
            prefix: prefix,
            command: command,
            params: params
        };
    }

}

const connectionInstance = new Connection();
export default connectionInstance;
