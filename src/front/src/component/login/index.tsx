import React, { useEffect } from 'react';
import { withRouter, useHistory, Link } from 'react-router-dom';
import { observer } from 'mobx-react';

interface IProps {}
interface IState {}

const Login = (props: IProps, state: IState) => {
  const history = useHistory();

  useEffect(() => {
    return () => {};
  });

  return (
    <div>
      <h2>~~~ Login ~~~</h2>
      <Link to="/">To Home</Link>
    </div>
  );
};

export default withRouter(observer(Login));
