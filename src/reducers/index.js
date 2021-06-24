import { combineReducers } from 'redux';
import user from './reducer_user';
import browser from './reducer_browser';
import active_properties from './reducer_active_properties';
import auth from './reducer_auth';
import bulk_columns from './reducer_amp_bulk_columns';
import amp_groups_mapping from './reducer_amp_groups_mapping';
import actions from './reducer_get_todays_actions';
import unscheduled_issues from './reducer_get_unscheduled_issues';
import notifications from './reducer_notifications';
import drmDeals from './reducer_drm_deals';
import files from './reducer_files';
import upload from './reducer_upload';
import drmUsers from './reducer_drm_users';
import drmGroups from './reducer_groups';
import galleryHandler from './reducer_gallery';
import estimateIssue from './reducer_estimate';
import invoiceIssue from './reducer_invoice';
import history from './reducer_history';
import owner_message from './reducer_owner_message';
import resolved_issues from './reducer_get_resolved_issues';
import all_issues from './reducer_get_all_issues';

export default combineReducers({
  user,
  browser,
  active_properties,
  auth,
  bulk_columns,
  amp_groups_mapping,
  actions,
  unscheduled_issues,
  notifications,
  drmDeals,
  files,
  upload,
  drmUsers,
  drmGroups,
  galleryHandler,
  estimateIssue,
  invoiceIssue,
  history,
  owner_message,
  resolved_issues,
  all_issues,
});
