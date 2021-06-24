import React, { Component } from 'react';
import { connect } from 'react-redux';
import './style.scss';
import logo from '../../assets/new/logo.png';

import {
  ArrowForward as LogoutIcon,
  Notifications,
  Person,
  Search as SearchIcon,
  SettingsApplications as SettingsIcon,
  Update as UpdateIcon,
} from '@material-ui/icons/';
import { Link, withRouter } from 'react-router-dom';
import DropdownButton from '../Dropdown/DropdownButton';
import Dropdown from '../Dropdown/Dropdown';
import { logout } from '../../actions';
import NavSearch from './NavSearch';

class Navbar extends Component {
  getRouterMap() {
    const { pathname } = this.props.location;
    /**
     * Important, keep these in sync with the frontend routes
     */
    return {
      schedules: pathname === '/',
      issues: pathname === '/issues',
      payments: pathname === '/payments',
      reports: pathname === '/reports',
      annual: pathname.indexOf('/amp/') > -1,
    };
  }

  getUserDropdownData = () => {
    const user = this.props.user.data || {};
    return {
      className: 'user-dropdown',
      show: true,
      items: [
        {
          render: key => (
            <div key={key} className="user-dropdown-user-item">
              <div className="avatar-wrapper">
                <img className="avatar" src={`/file/${user.avatar}?drm=true`} />
              </div>
              <span className="username">{user.username}</span>
            </div>
          ),
        },
        {
          icon: <UpdateIcon className="user-dropdown-icon" />,
          text: 'System Updates',
        },
        {
          icon: <SettingsIcon className="user-dropdown-icon" />,
          text: 'Settings',
        },
        {
          icon: <LogoutIcon className="user-dropdown-icon" />,
          text: 'Logout',
          onClick: this.props.logout,
        },
      ],
    };
  };

  render() {
    const { data, fetched } = this.props.user;

    if (!fetched || !data) return null;
    const routerMap = this.getRouterMap();

    return (
      <div className="header">
        <div className="header_logo">
          <Link to="/">
            <img src={logo} />
          </Link>
          <h1>ResolveiT</h1>
        </div>

        <nav className="header_nav">
          <li>
            <ul className={routerMap.schedules ? 'header_nav_active' : ''}>
              <Link to="/">Schedules</Link>
            </ul>
            <ul className={routerMap.issues ? 'header_nav_active' : ''}>
              <Link to="/issues">Issues</Link>
            </ul>
            <ul className={routerMap.payments ? 'header_nav_active' : ''}>
              <Link to="/payments">Payments</Link>
            </ul>
            <ul className={routerMap.reports ? 'header_nav_active' : ''}>
              <Link to="/reports">Reports</Link>
            </ul>
            <ul className={routerMap.annual ? 'header_nav_active' : ''}>
              <Link to="/amp/2020">Amp</Link>
            </ul>
          </li>
        </nav>
        <div className="right-side-wrapper">
          <NavSearch listings={[]} />
          <div className="right-icons">
            <Notifications className="nav-icon" />
            <DropdownButton
              style={{ display: 'inline-block' }}
              dropdown={<Dropdown data={this.getUserDropdownData()} />}
            >
              {data.avatar ? (
                <img
                  className="nav-avatar avatar"
                  src={`/file/${data.avatar}?drm=true`}
                />
              ) : (
                <Person className="nav-icon" />
              )}
            </DropdownButton>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user, browser }) => ({ user, browser });

const NavbarRouter = withRouter(Navbar);

export default connect(mapStateToProps, { logout })(NavbarRouter);
