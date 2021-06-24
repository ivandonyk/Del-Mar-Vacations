import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import 'toastr/build/toastr.min.css';
import './index.css';
import App from './App';

// required for any drag and drop events
window.addEventListener(
  'dragover',
  e => {
    e.preventDefault();
  },
  false,
);
window.addEventListener(
  'drop',
  e => {
    e.preventDefault();
  },
  false,
);

render(
  <CookiesProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CookiesProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
