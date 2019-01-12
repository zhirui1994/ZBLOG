import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import IndexPage from './Index';
import EditorPage from './Editor';
import ArticlePage from './Article';

const routerConfig = [
    {
        path: '/',
        exact: true,
        component: IndexPage,
    },
    {
        path: '/editor',
        exact: true,
        component: EditorPage,
    },
    {
        path: '/article/:number',
        exact: true,
        component: ArticlePage,
    }
];

const App = () => {
    return (
        <Router>
            <Switch>
                {routerConfig.map(route =>
                    (<Route
                        key={route.path}
                        path={route.path}
                        exact={route.exact}
                        component={route.component}
                    />)
                )}
            </Switch>
        </Router>
    );
}

export default App;