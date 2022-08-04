import React, { useEffect } from 'react';
import { withRouter, useHistory, Link } from 'react-router-dom';
import { observer } from 'mobx-react';

interface IProps {}
interface IState {}

const Home = (props: IProps, state: IState) => {
  const history = useHistory();

  useEffect(() => {
    return () => {};
  });

  return (
    <div>
      <h2>Home Page</h2>
      <h2>Home Page</h2>
      <Link to="/login">To Login</Link>
    </div>
  );
};

export default withRouter(observer(Home));
