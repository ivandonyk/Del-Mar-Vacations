import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import configureStore from './store/configureStore';
import API_ENDPOINTS from './helpers/api_endpoints';
import { DELMAR_TOKEN, FETCHED_USER_FAILURE } from './constants';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/';
import Issues from './components/Issues';
import AnnualMaintenancePlan from './components/AnnualMaintenancePlan';
import PrivateRoute from './routes/PrivateRoute';
import ExternalLogin from './routes/ExternalLogin';
import { Loader } from './components/Loader';
import { loginSuccess } from './actions';
import './components/main.scss';
const store = configureStore();

// Add a request interceptor for token auth
axios.interceptors.request.use(config => {
  const token = localStorage.getItem(DELMAR_TOKEN);

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
    this.loginSource = API_ENDPOINTS.LOGIN_PORTAL;
  }

  componentDidMount = async () => {
    window.addEventListener('resize', this.handleWindowResize);
    console.warn = () => {};

    await this.checkUserLoggedIn();
  };

  componentWillUnmount() {
    window.removeEventListener('message', this.onTokenReceived);
  }

  handleWindowResize = () => {
    store.dispatch({ type: 'WINDOW_RESIZED' });
  };

  checkUserLoggedIn = () => {
    const token = localStorage.getItem(DELMAR_TOKEN);

    if (token) {
      window.addEventListener('message', this.onTokenReceived);
      const iframe = document.createElement('iframe');
      iframe.hidden = true;
      iframe.src = this.loginSource;
      iframe.id = 'login-iframe';
      document.body.appendChild(iframe);
      iframe.onload = () => {
        const win = iframe.contentWindow;
        if (win) {
          const msg = {
            id: 'fetch',
          };
          store.dispatch({
            type: FETCHED_USER_FAILURE,
            payload: 'Permission denied',
          });
          win.postMessage(msg, '*');
        }
      };
    } else {
      store.dispatch({
        type: FETCHED_USER_FAILURE,
        payload: 'Permission denied',
      });
      return this.setState({ loaded: true });
    }
  };

  onTokenReceived = event => {
    try {
      const message = event.data;
      if (message && message.id === 'token') {
        // console.log('token', message);
        if (message.token) {
          store.dispatch(loginSuccess(message.token));
        } else {
          localStorage.removeItem(DELMAR_TOKEN);
          store.dispatch({ type: FETCHED_USER_FAILURE });
        }
        const tempIframe = document.getElementById('login-iframe');
        window.removeEventListener('message', this.onTokenReceived);
        tempIframe && tempIframe.remove();
        return this.setState({ loaded: true });
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const { loaded } = this.state;

    if (!loaded) {
      return <Loader />;
    }

    const App = () => (
      <Switch>
        <Route path="/login" component={ExternalLogin} />
        <PrivateRoute exact path="/issues" component={Issues} />
        <PrivateRoute exact path="/" component={Home} />
        <PrivateRoute
          exact
          path="/amp/:year"
          component={AnnualMaintenancePlan}
        />
      </Switch>
    );
    return (
      <Provider store={store}>
        <Navbar />
        <App />
      </Provider>
    );
  }
}

export default App;
