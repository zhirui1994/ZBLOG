import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

const routerConfig = [
    {
        path: '/',
        exact: true,
        component:  lazy(() => import('./Index')),
    },
    {
        path: '/editor',
        exact: true,
        component: lazy(() => import('./Editor')),
    },
    {
        path: '/article/:number',
        exact: true,
        component: lazy(() => import('./Article')),
    }
];

const App = () => {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
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
            </Suspense>
        </Router>
    );
}

export default App;