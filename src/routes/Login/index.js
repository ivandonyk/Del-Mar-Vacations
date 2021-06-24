import React, { Component } from 'react';
import { Link, Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions';
import DelmarWindowImage from '../../assets/delmar_window.png';
import DelmarWindowImageGif from '../../assets/delmar_window.gif';
import DelmarBirds from '../../assets/birds.png';
import Checked from '../../assets/check-24px.svg';
import './style.scss';
import Utils from '../../helpers/utils';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rememberMe: false,
      loading: false,
      username: '',
      password: '',
    };
  }

  componentDidMount() {
    Utils.preloadImage(DelmarWindowImageGif);
    this.loadRememberMe();
  }

  toggleRememberMe = () => {
    const { rememberMe } = this.state;
    if (rememberMe) {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }
    this.setState({
      rememberMe: !rememberMe,
    });
  };

  loadRememberMe = () => {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe) {
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');
      this.setState({
        rememberMe: true,
        username,
        password,
      });
    }
  };

  rememberMe = () => {
    const { username, password } = this.state;
    localStorage.setItem('rememberMe', true);
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
  };

  login = () => {
    // give a sense of wait and show fancy loading animation
    this.setState(
      { loading: true },
      () => this.state.rememberMe && this.rememberMe(),
    );

    setTimeout(() => {
      const { username, password } = this.state;
      this.props.login(username, password, this.props.history);
      this.setState({ loading: false });
    }, 2000);
  };

  handleUsernameChange = event => {
    this.setState({ username: event.target.value });
  };

  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  };

  onPasswordEnter = event => {
    if (event.keyCode === 13) this.login();
  };

  render() {
    const { rememberMe, loading } = this.state;
    const { user, location } = this.props;
    const { error } = user;

    if (user.fetched && user.data) {
      if (location.state && location.state.from) {
        return <Redirect to={location.state.from.pathname} />;
      }

      return <Redirect to="/amp/2020" />;
    }

    return (
      <div
        style={{ backgroundImage: `url(${DelmarBirds})` }}
        className="login-page"
      >
        <div className="login-wrapper">
          <div className="login-img-wrapper">
            <img
              src={
                user.fetching || loading
                  ? DelmarWindowImageGif
                  : DelmarWindowImage
              }
              alt=""
            />
          </div>
          {error && user.fetched && (
            <div className="login-error login-message">
              <span className="big-error">ERROR:</span> Your username or
              password is incorrect.&nbsp;
              <Link to="/login/reset">Lost your password?</Link>
            </div>
          )}
          <div className="login-form">
            <div className="form-input">
              <label htmlFor="username">Username</label>
              <input
                onChange={this.handleUsernameChange}
                value={this.state.username}
                id="username"
                type="text"
              />
            </div>
            <div className="form-input">
              <label htmlFor="password">Password</label>
              <input
                onChange={this.handlePasswordChange}
                onKeyDown={this.onPasswordEnter}
                value={this.state.password}
                id="password"
                type="password"
              />
            </div>
            <div className="login-form-submit">
              <div className="remember-me">
                <span
                  style={
                    rememberMe ? { backgroundImage: `url(${Checked})` } : null
                  }
                  onClick={this.toggleRememberMe}
                  id="remember-me"
                />
                <label htmlFor="remember-me">Remember Me</label>
              </div>
              <button onClick={this.login} type="button">
                Login
              </button>
            </div>
            <div className="forgot-password">
              <Link to="/login/reset">Lost your password?</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user, browser }) => ({ user });

export default connect(mapStateToProps, { login })(Login);
