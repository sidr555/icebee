import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from 'react-router-dom';

import moAuth from '@subStore/auth';
import Home from '@comp/home/index';
import Login from '@comp/login/index';

const AppRoute = () => {
  const { isAuth } = moAuth;

  return (
    <Router>
      <Switch>
        <Route exact={true} path="/"
          render={({ location }) => (
            isAuth ? (
              <Home />
            ) : (
              <Redirect to={{
                pathname: '/login',
                state: { from: location },
              }} />
            )
          )} />
        <Route exact={true} path="/login" component={Login} />
        <Route path="*"
          render={({ location }) => (
            isAuth ? (
              <Home />
            ) : (
              <Redirect to={{
                pathname: '/login',
                state: { from: location },
              }} />
            )
          )} />
      </Switch>
    </Router>
  );
};

export default AppRoute;
