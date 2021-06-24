import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isLoggedIn = () => rest.user && rest.user.data && rest.user.fetched;

  const hasPermissions = () => {
    const { path } = rest;

    if (path === '/leads') {
      return rest.user.data && rest.user.data._roles.marketing;
    }

    if (path === '/leads/bulkupload') {
      return rest.user.data && rest.user.data._roles.bulk_upload;
    }

    if (path === '/deals') {
      return rest.user.data && rest.user.data._roles.deal_pipeline;
    }

    if (path === '/activitylog') {
      return rest.user.data && rest.user.data._roles.log;
    }

    if (path === '/owner/manage') {
      return rest.user.data && rest.user.data._roles.admin;
    }

    return true;
  };

  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(PrivateRoute);
