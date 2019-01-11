import React from 'react';
import ReactDOM from 'react-dom';
import { init } from '@rematch/core';
import { Provider } from 'react-redux';
import models from './models/index';
import * as serviceWorker from './services/serviceWorker';
import IndexPage from './pages/Index';
import EditorPage from './pages/Editor';
import './styles/index.scss';

export const store = init({
    models,
}) 

ReactDOM.render(
    <Provider store={store}>
        <IndexPage />
        {/* <EditorPage /> */}
    </Provider>,
    document.getElementById('root')
);

serviceWorker.unregister();
