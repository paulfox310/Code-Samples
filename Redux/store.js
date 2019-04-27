import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import UserReducer from "./reducers/UserReducer";
import AdvertiserReducer from "./reducers/AdvertiserReducer";

const reducerArgs = { UserReducer, AdvertiserReducer };

const reducers = combineReducers(reducerArgs);

const rLogger = createLogger();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducers,
  {},
  composeEnhancers(applyMiddleware(rLogger, thunk))
);

export default store;
