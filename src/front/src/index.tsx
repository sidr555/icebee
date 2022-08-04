import React from 'react';
import ReactDOM from 'react-dom';

import reportWebVitals from './reportWebVitals';
import App from './App';

const container = document.getElementById('root');

// @ts-ignore
const root = ReactDOM.createRoot(container);

root.render(<App />);

/** qiankun lifecycle */

// bootstarp
const bootstrap = async () => {
  // console.log('~~~ bootstraped ~~~');
};

// mount
const mount = async (props: any) => {
  // console.log('~~~ mount ~~~');
  const container = document.getElementById('root');
  // @ts-ignore
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
};

// unmount
const unmount = async (props: any) => {
  // console.log('~~~ unmount ~~~ ', props);
  ReactDOM.unmountComponentAtNode(props.container);
};

// update
const update = async (props: any) => {
  // console.log('~~~ update ~~~ props', props);
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

export {
  bootstrap,
  mount,
  unmount,
  update,
};
