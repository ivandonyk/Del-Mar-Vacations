import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { loginSuccess } from '../../actions';
import { DELMAR_TOKEN } from '../../constants';

import './style.scss';
import API_ENDPOINTS from '../../helpers/api_endpoints';

class ExternalLogin extends Component {
  constructor(props) {
    super(props);
    this.loginSource = API_ENDPOINTS.LOGIN_PORTAL;

    const query = props.location.search;
    if (query && query.includes('reset')) {
      const params = new URLSearchParams(query);
      const resetHash = params.get('reset');
      this.loginSource = `${this.loginSource}/reset/${resetHash}`;
    }
    this.childWindow = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('message', this.onTokenReceived);
    if (!localStorage.getItem(DELMAR_TOKEN)) {
      const iframe = this.childWindow.current;
      iframe.onload = () => {
        const win = iframe.contentWindow;
        if (win) {
          const msg = {
            id: 'fetch',
          };
          win.postMessage(msg, '*');
        }
      };
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onTokenReceived);
  }

  onTokenReceived = event => {
    try {
      const message = event.data;
      if (message && message.id === 'token') {
        if (message.token) {
          localStorage.setItem(DELMAR_TOKEN, message.token);
          this.props.loginSuccess(message.token, this.props.history);
        } else {
          localStorage.removeItem(DELMAR_TOKEN);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const { user } = this.props;

    if (user.fetched && user.data) {
      const { location } = this.props;
      if (location.state && location.state.from.pathname) {
        return <Redirect to={location.state.from.pathname} />;
      }
      return <Redirect to="/" />;
    }

    return (
      <iframe
        ref={this.childWindow}
        className="external-login"
        src={this.loginSource}
      />
    );
  }
}

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps, { loginSuccess })(ExternalLogin);
