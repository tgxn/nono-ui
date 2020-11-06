import { combineReducers } from 'redux';

import gameReducer from './reducers/gameReducer';

const reducers = combineReducers({
    gameReducer,
});

export default reducers;
