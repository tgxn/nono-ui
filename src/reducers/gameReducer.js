
export const setTurn = parsedMessage => {
    console.log("setTurn", parsedMessage);
    return {
        type: 'setTurn',
        parsedMessage
    };
};

export const setTop = parsedMessage => {
    console.log("setTop", parsedMessage);
    return {
        type: 'setTop',
        parsedMessage
    };
};

export const setHand = parsedMessage => {
    console.log("setHand", parsedMessage);
    return {
        type: 'setHand',
        parsedMessage
    };
};

const initialState = {
    turn: false,
    hand: [],
    top: [],
};

const gameReducer = (state = initialState, action = {}) => {
    switch (action.type) {

        case 'setTurn':
            return {
                ...state,
                activeInfoTab: action.activeTabName
            };

        case 'setTop':
            return {
                ...state,
                activeInfoTab: action.activeTabName
            };

        case 'setHand':
            return {
                ...state,
                activeInfoTab: action.activeTabName
            };

        default:
            return state;
    }
};

export default gameReducer;
