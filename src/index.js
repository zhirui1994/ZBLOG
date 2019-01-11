import React from 'react';
import ReactDOM from 'react-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import models from './models/index';
import * as serviceWorker from './services/serviceWorker';
import App from './pages/App';
import './styles/index.scss';

export const store = init({
    models,
}) 

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);

serviceWorker.unregister();
