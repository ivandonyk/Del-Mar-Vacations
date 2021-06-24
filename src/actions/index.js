import {
  ADDING_ONE_TAG,
  ADDING_ONE_TAG_FAILURE,
  ADDING_ONE_TAG_SUCCESS,
  CLOSE_GALLERY,
  CLOSE_NOTIFICATION,
  CREATING_CELLS_FAILURE,
  CREATING_CELLS_SUCCESS,
  DELETING_FILE,
  DELETING_FILES_FAILURE,
  DELETING_FILES_SUCCESS,
  DEASSOCIATING_FILE_SUCCESS,
  DELMAR_TOKEN,
  FETCHED_FILES_FAILURE,
  FETCHED_FILES_SUCCESS,
  FETCHED_USER_FAILURE,
  FETCHED_USER_SUCCESS,
  FETCHING_ACTIVE_PROPERTIES,
  FETCHING_ACTIVE_PROPERTIES_FAILURE,
  FETCHING_ACTIVE_PROPERTIES_SUCCESS,
  FETCHING_AMP_GROUPS_MAPPING,
  FETCHING_AMP_GROUPS_MAPPING_FAILURE,
  FETCHING_AMP_GROUPS_MAPPING_SUCCESS,
  FETCHING_BULK_COLUMNS,
  FETCHING_BULK_COLUMNS_FAILURE,
  FETCHING_BULK_COLUMNS_SUCCESS,
  FETCHING_DRM_DEALS,
  FETCHING_DRM_DEALS_FAILURE,
  FETCHING_DRM_DEALS_SUCCESS,
  FETCHING_DRM_GROUPS,
  FETCHING_DRM_GROUPS_FAILURE,
  FETCHING_DRM_GROUPS_SUCCESS,
  FETCHING_DRM_USERS,
  FETCHING_DRM_USERS_FAILURE,
  FETCHING_DRM_USERS_SUCCESS,
  FETCHING_ESTIMATE,
  FETCHING_ESTIMATE_FAILURE,
  FETCHING_ESTIMATE_SUCCESS,
  FETCHING_FILES,
  FETCHING_HISTORY,
  FETCHING_HISTORY_FAILURE,
  FETCHING_HISTORY_SUCCESS,
  FETCHING_INVOICE,
  FETCHING_INVOICE_FAILURE,
  FETCHING_INVOICE_SUCCESS,
  FETCHING_OWNER_MESSAGE,
  FETCHING_OWNER_MESSAGE_FAILURE,
  FETCHING_OWNER_MESSAGE_SUCCESS,
  FETCHING_TAGS,
  FETCHING_TAGS_FAILURE,
  FETCHING_TAGS_SUCCESS,
  FETCHING_TODAYS_ACTIONS,
  FETCHING_TODAYS_ACTIONS_FAILURE,
  FETCHING_TODAYS_ACTIONS_SUCCESS,
  FETCHING_UNSCHEDULED_ISSUES,
  FETCHING_UNSCHEDULED_ISSUES_FAILURE,
  FETCHING_UNSCHEDULED_ISSUES_SUCCESS,
  FETCHING_USER,
  OPEN_GALLERY,
  OPEN_NOTIFICATION,
  REMOVING_ONE_TAG,
  REMOVING_ONE_TAG_FAILURE,
  REMOVING_ONE_TAG_SUCCESS,
  UPDATING_ONE_ACTION,
  UPDATING_ONE_ACTION_FAILURE,
  UPDATING_ONE_ACTION_SUCCESS,
  UPLOADED_FILE_FAILURE,
  UPLOADED_FILE_SUCCESS,
  UPLOADING_FILE,
  FETCHING_RESOLVED_ISSUES,
  FETCHING_RESOLVED_ISSUES_SUCCESS,
  FETCHING_RESOLVED_ISSUES_FAILURE,
  ARCHIVING_ONE_ISSUE,
  ARCHIVING_ONE_ISSUE_SUCCESS,
  ARCHIVING_ONE_ISSUE_FAILURE,
  RESOLVING_ONE_ISSUE,
  RESOLVING_ONE_ISSUE_SUCCESS,
  RESOLVING_ONE_ISSUE_FAILURE,
  FETCHING_ALL_ISSUES,
  FETCHING_ALL_ISSUES_SUCCESS,
  FETCHING_ALL_ISSUES_FAILURE,
  FLUSH_FILES,
} from '../constants';
import API from '../helpers/api';
import moment from 'moment';
import API_ENDPOINTS from '../helpers/api_endpoints';
import toastr from 'toastr';

export function login(username, password, history = null) {
  return dispatch => {
    dispatch({
      type: FETCHING_USER,
    });
    API.login(username, password)
      .then(response => {
        if (response.status === 200 && response.data) {
          const user = response.data;

          if (user) {
            if (user.token) {
              localStorage.setItem('token', user.token);
            }
            if (user.default_page) {
              if (user.default_page.startsWith('/#')) {
                // return (window.location.href = user.default_page);
                return (window.location.href = '/');
              }
            }
          }

          dispatch({
            type: FETCHED_USER_SUCCESS,
            payload: response.data,
          });

          if (user && user.default_page && history) {
            // history.push(user.default_page);
            history.push('/');
          }

          return;
        }
        return dispatch({
          type: FETCHED_USER_FAILURE,
          payload: 'API error',
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHED_USER_FAILURE,
          payload: err,
        }),
      );
  };
}

export function loginSuccess(token, history = null) {
  return dispatch => {
    try {
      if (token) {
        const claim = token.split('.')[0];
        const user = JSON.parse(atob(claim));

        if (user) {
          if (user.default_page) {
            if (user.default_page.startsWith('/#')) {
              dispatch({
                type: FETCHED_USER_SUCCESS,
                payload: user,
              });

              // return (window.location.href = user.default_page);
              return (window.location.href = '/');
            }
          }
          dispatch({
            type: FETCHED_USER_SUCCESS,
            payload: user,
          });

          if (user && user.default_page && history) {
            history.push('/');
          }
        }
      } else {
        return dispatch({
          type: FETCHED_USER_FAILURE,
        });
      }
    } catch (err) {
      localStorage.removeItem(DELMAR_TOKEN);
      return dispatch({
        type: FETCHED_USER_FAILURE,
        payload: err,
      });
    }
  };
}

// export function logout() {
//   return dispatch => {
//     localStorage.removeItem(DELMAR_TOKEN);
//     dispatch({ type: FETCHED_USER_FAILURE });
//     // API.logout()
//     //   .then(resp => {
//     //     dispatch({ type: FETCHED_USER_FAILURE });
//     //   })
//     //   .catch(err => {
//     //     // do nothing, user did not logout
//     //   });
//   };
// }

export function logout() {
  return dispatch => {
    localStorage.removeItem(DELMAR_TOKEN);

    // hacky but the only way to go about it
    // in order to delete the JWT on the loginportal domain
    const iframe = document.createElement('iframe');
    iframe.hidden = true;
    iframe.src = API_ENDPOINTS.LOGIN_PORTAL;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (win) {
        const msg = {
          id: 'delete',
        };
        win.postMessage(msg, '*');
        dispatch({ type: FETCHED_USER_FAILURE });
      }
    };
  };
}

export function getDrmDeals() {
  return dispatch => {
    dispatch({
      type: FETCHING_DRM_DEALS,
    });

    API.getDrmDeals()
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_DRM_DEALS_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_DRM_DEALS_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_DRM_DEALS_FAILURE,
        }),
      );
  };
}

export function getActiveProperties(activeTab, offset = 0, rows = null) {
  return (dispatch, getState) => {
    !rows &&
      dispatch({
        type: FETCHING_ACTIVE_PROPERTIES,
      });

    const token = localStorage.getItem(DELMAR_TOKEN);

    API.getActivePropeties(token, activeTab, offset, rows)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_ACTIVE_PROPERTIES_SUCCESS,
            payload: resp.data,
          });
        }
        return dispatch({
          type: FETCHING_ACTIVE_PROPERTIES_FAILURE,
          payload: [],
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ACTIVE_PROPERTIES_FAILURE,
          payload: [],
        }),
      );
  };
}

// activeTab - [Opening, Closing,Pest...]
// type: [rows,columns]
export function updateBulkCells(updateQueue, type) {
  return dispatch => {
    if (Array.isArray(updateQueue) || typeof updateQueue === 'object') {
      return API.updateCellsBulk({ updateQueue, type })
        .then(resp => {
          if (resp.data && resp.data.updated) {
            dispatch(
              showNotification(
                `You have successfully edited ${resp.data.updated} home(s).`,
              ),
            );
          }
          return type === 'rows'
            ? dispatch(
                getActiveProperties(
                  null,
                  null,
                  updateQueue.map(item => item.id),
                ),
              )
            : dispatch(getActiveProperties(null, null));
        })
        .catch(err => {
          console.log(err.message);
          return dispatch({
            type: FETCHING_ACTIVE_PROPERTIES_FAILURE,
            payload: [],
          });
        });
    }
    return dispatch({
      type: FETCHING_ACTIVE_PROPERTIES_FAILURE,
      payload: [],
    });
  };
}

export function getBulkColumnHeaders(year) {
  return (dispatch, getState) => {
    const { user } = getState();
    if (user.fetched && user.data) {
      const { username } = user.data;
      dispatch({
        type: FETCHING_BULK_COLUMNS,
      });
      API.getBulkColumnValues(username, year).then(resp => {
        if (resp.status === 200) {
          console.log(resp.data);
          return dispatch({
            type: FETCHING_BULK_COLUMNS_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_BULK_COLUMNS_FAILURE,
          payload: resp.data,
        });
      });
    }
  };
}

export function setBulkColumnHeaders(values) {
  return (dispatch, getState) => {
    const { user, bulk_columns } = getState();
    if (user.fetched && user.data) {
      API.setBulkColumnHeaders({
        ...values,
        username: user.data.username,
      })
        .then(resp =>
          dispatch({
            type: FETCHING_BULK_COLUMNS_SUCCESS,
            payload: [
              ...bulk_columns.data.filter(item => item.id !== resp.data.id),
              resp.data,
            ],
          }),
        )
        .catch(err => console.log(err.message));
    }
  };
}

export function getAmpGroupsMapping() {
  return dispatch => {
    dispatch({
      type: FETCHING_AMP_GROUPS_MAPPING,
    });
    API.getGroupsMapping()
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_AMP_GROUPS_MAPPING_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_AMP_GROUPS_MAPPING_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_AMP_GROUPS_MAPPING_FAILURE,
        }),
      );
  };
}

export function getTodaysActions(day) {
  return dispatch => {
    dispatch({
      type: FETCHING_TODAYS_ACTIONS,
    });
    API.getTodaysActions(day)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_TODAYS_ACTIONS_SUCCESS,
            payload: { day: moment(day).format('MM/DD/YYYY'), data: resp.data },
          });
        }
        dispatch({
          type: FETCHING_TODAYS_ACTIONS_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_TODAYS_ACTIONS_FAILURE,
        }),
      );
  };
}

export function getIssuesWithUnscheduledActions() {
  return dispatch => {
    dispatch({
      type: FETCHING_UNSCHEDULED_ISSUES,
    });
    API.getIssuesWithUnscheduledActions()
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_UNSCHEDULED_ISSUES_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_UNSCHEDULED_ISSUES_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_UNSCHEDULED_ISSUES_FAILURE,
        }),
      );
  };
}

export function getResolvedIssues(page, pageSize) {
  return dispatch => {
    dispatch({
      type: FETCHING_RESOLVED_ISSUES,
    });
    API.getResolvedIssues(page, pageSize)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_RESOLVED_ISSUES_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_RESOLVED_ISSUES_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_RESOLVED_ISSUES_FAILURE,
        }),
      );
  };
}

export function getAllIssues(page, pageSize, filter, sortMethod) {
  return dispatch => {
    dispatch({
      type: FETCHING_ALL_ISSUES,
    });
    API.getAllIssues(page, pageSize, filter, sortMethod)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_ALL_ISSUES_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_ALL_ISSUES_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ALL_ISSUES_FAILURE,
        }),
      );
  };
}

export function updateOneAction(action) {
  console.log('updateOneAction', action);
  return dispatch => {
    dispatch({
      type: UPDATING_ONE_ACTION,
    });

    API.scheduleAction(action)
      .then(resp => {
        if (resp.status === 200) {
          dispatch({
            type: UPDATING_ONE_ACTION_SUCCESS,
            payload: {
              day: action.assignedDay.format('MM/DD/YYYY'),
              data: resp.data,
            },
          });

          return dispatch(getIssuesWithUnscheduledActions());
        }
        dispatch({
          type: UPDATING_ONE_ACTION_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: UPDATING_ONE_ACTION_FAILURE,
          err,
        }),
      );
  };
}

export function createOneAction(actionData) {
  return dispatch => {
    API.createAction(actionData)
      .then(resp => {
        console.log('action created', resp.data);
        dispatch(getIssuesWithUnscheduledActions());
        successNotification(
          `You have successfully created a new action for property #${resp.data.Issue.DrmDeal.houseNum}`,
        );
        return dispatch({
          type: UPDATING_ONE_ACTION_SUCCESS,
          payload: {
            day: moment(actionData.action_date).format('MM/DD/YYYY'),
            data: resp.data,
          },
        });
      })
      .catch(err => {
        console.log("can't create action", err.message);
        dispatch({
          type: UPDATING_ONE_ACTION_FAILURE,
        });
      });
  };
}

export function updateAction(actionId, updateData) {
  return dispatch => {
    API.updateAction(actionId, updateData)
      .then(resp => {
        dispatch(getIssuesWithUnscheduledActions());
      })
      .catch(err => console.log(err));
  };
}

export function createIssue(issueData, allPage, resolvedPage, pageLength) {
  return dispatch => {
    API.createIssue(issueData)
      .then(resp => {
        console.log('issue created', resp.data);
        dispatch(getIssuesWithUnscheduledActions());
        dispatch(getAllIssues(allPage, pageLength));
        dispatch(getResolvedIssues(resolvedPage, pageLength));
        dispatch(getTodaysActions(new moment().toDate()));
        successNotification('You have successfully created a new issue.');
      })
      .catch(err => {
        console.log('cant create issue', err.message);
      });
  };
}

export function updateOneIssue(issueData) {
  return dispatch => {
    API.updateIssue(issueData)
      .then(resp => {
        console.log('issue updated', resp.data);
        successNotification('Issue updated successfully');
        return dispatch(getIssuesWithUnscheduledActions());
      })
      .catch(err => {
        console.log('cant create issue', err.message);
      });
  };
}

export function showNotification(message) {
  return dispatch => {
    dispatch({
      type: OPEN_NOTIFICATION,
      message,
    });
    setTimeout(() => {
      dispatch({
        type: CLOSE_NOTIFICATION,
      });
    }, 2000);
  };
}

export function getAllIssueTags() {
  return dispatch => {
    dispatch({
      type: FETCHING_TAGS,
    });
    API.getAllIssueTags()
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_TAGS_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_TAGS_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_TAGS_FAILURE,
        }),
      );
  };
}

export function removeTag(tag, associate_id, table) {
  return dispatch => {
    dispatch({
      type: REMOVING_ONE_TAG,
    });
    API.removeTag(tag, associate_id, table)
      .then(resp => {
        dispatch({
          type: REMOVING_ONE_TAG_SUCCESS,
          payload: {
            data: resp.data,
          },
        });
        return dispatch(getIssuesWithUnscheduledActions());
      })
      .catch(err =>
        dispatch({
          type: REMOVING_ONE_TAG_FAILURE,
        }),
      );
  };
}

export function addTag(tag, associate_id, table) {
  return dispatch => {
    dispatch({
      type: ADDING_ONE_TAG,
    });
    console.log(tag, associate_id, table);
    API.addTag(tag, associate_id, table)
      .then(resp => {
        dispatch({
          type: ADDING_ONE_TAG_SUCCESS,
          payload: {
            data: resp.data,
          },
        });
        dispatch(getTodaysActions());
        return dispatch(getIssuesWithUnscheduledActions());
      })
      .catch(err =>
        dispatch({
          type: ADDING_ONE_TAG_FAILURE,
        }),
      );
  };
}

export function uploadFile(formData) {
  return dispatch => {
    dispatch({
      type: UPLOADING_FILE,
    });
    API.uploadFiles(formData)
      .then(response => {
        dispatch({
          type: UPLOADED_FILE_SUCCESS,
        });
      })
      .catch(response => {
        dispatch({
          type: UPLOADED_FILE_FAILURE,
          payload: response.error,
        });
      });
  };
}

export function getFiles(parentTable, parentId) {
  return dispatch => {
    dispatch({
      type: FETCHING_FILES,
    });
    (Array.isArray(parentId)
      ? API.getMultipleFiles(parentTable, parentId.join(','))
      : API.getFiles(parentTable, parentId)
    )
      .then(response => {
        dispatch({
          type: FETCHED_FILES_SUCCESS,
          payload: response.data,
        });
      })
      .catch(response => {
        dispatch({
          type: FETCHED_FILES_FAILURE,
        });
      });
  };
}

export function deleteFile(id) {
  return (dispatch, getState) => {
    const { files } = getState();
    const { key } = (files.data || []).find(item => item.id === id) || {};

    dispatch({
      type: DELETING_FILE,
    });
    API.deleteFile(id)
      .then(response => {
        dispatch({
          type: DELETING_FILES_SUCCESS,
          payload: key,
        });
      })
      .catch(response => {
        dispatch({
          type: DELETING_FILES_FAILURE,
        });
      });
  };
}

export function addFileAssociation(associations) {
  return dispatch => {
    console.log('addFileAssociation', associations);
    API.addFileAssociation(associations)
      .then(resp => {
        console.log(resp.data);
        dispatch(
          getFiles(
            associations[0].table_name,
            associations.map(it => it.parent_id),
          ),
        );
      })
      .catch(response => {
        dispatch({
          type: UPLOADED_FILE_FAILURE,
          payload: response.error,
        });
      });
  };
}

export function flushFiles(tableName) {
  return dispatch => {
    dispatch({
      type: FLUSH_FILES,
      payload: tableName
    });
  }
}

/** The deassociation Id parameter if present tells the reducer 
 * to filter out the deassociated cached file by id from the state */
export function syncFileAssociations(tableName, associations, deAssocationId = false) {
  return dispatch => {
    console.log('syncFileAssociations', associations);

    // if we don't have a deassociation id then we need to flush out the
    // table being operated on to avoid duplicates
    if (!deAssocationId) {
      dispatch({
        type: FLUSH_FILES,
        payload: tableName
      });
    }
    
    API.syncFileAssociations(tableName, associations)
      .then(resp => {
        console.log(resp.data);
        if (deAssocationId) {
          dispatch({
            type: DEASSOCIATING_FILE_SUCCESS,
            payload: deAssocationId,
          });
        } else {
          dispatch(
            getFiles(
              tableName,
              associations.map(it => it.parent_id),
            ),
          );
        }
      })
      .catch(response => {
        dispatch({
          type: UPLOADED_FILE_FAILURE,
          payload: response.error,
        });
      });
  };
}

export function removeFileAssociation(id) {
  return (dispatch, getState) => {
    API.deassociateFile(id)
      .then(resp => {
        dispatch({
          type: DEASSOCIATING_FILE_SUCCESS,
          payload: id,
        });
      })
      .catch(response => {
        dispatch({
          type: DELETING_FILES_FAILURE,
          payload: response.error,
        });
      });
  };
}

export function successNotification(msg) {
  toastr.options = {
    positionClass: 'toast-top-full-width',
    hideDuration: 300,
    timeOut: 6000,
  };
  toastr.clear();
  setTimeout(() => toastr.success(`${msg}`), 300);
}

export function getDrmUsers() {
  return dispatch => {
    dispatch({
      type: FETCHING_DRM_USERS,
    });

    API.getDrmUsers()
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_DRM_USERS_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_DRM_USERS_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_DRM_USERS_FAILURE,
        }),
      );
  };
}

export function getDrmGroups() {
  return dispatch => {
    dispatch({
      type: FETCHING_DRM_GROUPS,
    });

    API.getDrmGroups()
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_DRM_GROUPS_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_DRM_GROUPS_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_DRM_GROUPS_FAILURE,
        }),
      );
  };
}

export function toggleGalleryModal(data_images) {
  return (dispatch, getState) => {
    const { images, galleryHandler } = getState();
    if (galleryHandler.isOpen === true) {
      return dispatch({
        type: CLOSE_GALLERY,
      });
    }

    if (Array.isArray(data_images)) {
      return dispatch({
        type: OPEN_GALLERY,
        payload: data_images,
      });
    }
    if (images.fetched && images.data) {
      return dispatch({
        type: OPEN_GALLERY,
        payload: data_images,
      });
    }
    return dispatch({
      type: CLOSE_GALLERY,
    });
  };
}

// *** Estimate(Quote) data.
export function getIssueEstimate(issueId) {
  return dispatch => {
    dispatch({
      type: FETCHING_ESTIMATE,
    });

    API.getEstimate(issueId)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch({
            type: FETCHING_ESTIMATE_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        }),
      );
  };
}

export function reviseIssueEstimate(issueId, data) {
  return dispatch => {
    dispatch({
      type: FETCHING_ESTIMATE,
    });

    API.reviseEstimate(issueId, data)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueEstimate(issueId));
        }
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        }),
      );
  };
}

export function updateIssueEstimate(estimateObj) {
  return dispatch => {
    dispatch({
      type: FETCHING_ESTIMATE,
    });

    API.putEstimate(estimateObj)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueEstimate(estimateObj.issueId));
        }
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        }),
      );
  };
}

export function addEstimateServices(issueId, service) {
  return dispatch => {
    API.addEstimateServices(service)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueEstimate(issueId));
        }
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        }),
      );
  };
}

export function removeEstimateService(issueId, serviceId) {
  return dispatch => {
    console.log('issueId, serviceId', issueId, serviceId);
    API.removeEstimateService(serviceId)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch(getIssueEstimate(issueId));
        }
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        }),
      );
  };
}
// *** END Estimate(Quote) data.

// *** Invoice data.
export function getIssueInvoice(issueId) {
  return dispatch => {
    dispatch({
      type: FETCHING_INVOICE,
    });

    API.getInvoice(issueId)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch({
            type: FETCHING_INVOICE_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        }),
      );
  };
}

export function updateIssueInvoice(invoiceObj) {
  return dispatch => {
    dispatch({
      type: FETCHING_INVOICE,
    });

    API.putInvoice(invoiceObj)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueInvoice(invoiceObj.issueId));
        }
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        }),
      );
  };
}

export function reviseIssueInvoice(issueId, data) {
  return dispatch => {
    dispatch({
      type: FETCHING_INVOICE,
    });

    API.reviseInvoice(issueId, data)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueInvoice(issueId));
        }
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        }),
      );
  };
}

export function addInvoiceServices(issueId, service) {
  return dispatch => {
    API.addInvoiceServices(service)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueInvoice(issueId));
        }
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        }),
      );
  };
}

export function removeInvoiceService(issueId, serviceId) {
  return dispatch => {
    console.log('issueId, serviceId', issueId, serviceId);
    API.removeInvoiceService(serviceId)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch(getIssueInvoice(issueId));
        }
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        }),
      );
  };
}
// *** END Invoice data.

export function getIssueHistory(issueId) {
  return dispatch => {
    dispatch({
      type: FETCHING_HISTORY,
    });
    API.getIssueHistory(issueId)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_HISTORY_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_HISTORY_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_HISTORY_FAILURE,
          error: err,
        }),
      );
  };
}

export function getIssueOwnerMessage(issueId) {
  return dispatch => {
    dispatch({
      type: FETCHING_OWNER_MESSAGE,
    });
    API.getIssueOwnerMessage(issueId)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch({
            type: FETCHING_OWNER_MESSAGE_SUCCESS,
            payload: resp.data,
          });
        }
        dispatch({
          type: FETCHING_OWNER_MESSAGE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_OWNER_MESSAGE_FAILURE,
        }),
      );
  };
}

export function updateIssueOwnerMessage(ownerMsg) {
  return dispatch => {
    dispatch({
      type: FETCHING_OWNER_MESSAGE,
    });

    API.putOwnerMsg(ownerMsg)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          return dispatch(getIssueOwnerMessage(ownerMsg.issueId));
        }
        dispatch({
          type: FETCHING_OWNER_MESSAGE_FAILURE,
        });
      })
      .catch(err =>
        dispatch({
          type: FETCHING_OWNER_MESSAGE_FAILURE,
        }),
      );
  };
}

export function sendNotifyOwnerMessage(id, ownerMsg, callback) {
  return dispatch => {
    dispatch({
      type: FETCHING_OWNER_MESSAGE,
    });

    API.sendNotifyOwnerMessage(id, ownerMsg)
      .then(resp => {
        if (resp.status === 200 && resp.data) {
          callback();
          successNotification('Your message was sent successfully');
          return dispatch(getIssueOwnerMessage(ownerMsg.issueId));
        }
        dispatch({
          type: FETCHING_OWNER_MESSAGE_FAILURE,
        });
      })
      .catch(err => {
        callback();
        dispatch({
          type: FETCHING_OWNER_MESSAGE_FAILURE,
        });
      });
  };
}


export function archiveOneIssue(issueId) {
  return dispatch => {
    dispatch({
      type: ARCHIVING_ONE_ISSUE,
    });

    API.archiveIssue(issueId)
      .then(resp => {
        if (resp.status === 200) {
          successNotification('Issue archived!');
          return dispatch(getIssuesWithUnscheduledActions());
        }
        dispatch({
          type: ARCHIVING_ONE_ISSUE_SUCCESS,
        });
      })
      .catch(err =>
        dispatch({
          type: ARCHIVING_ONE_ISSUE_FAILURE,
        }),
      );
  };
}


export function resolveOneIssue(issueId, resolvedType) {
  return dispatch => {
    dispatch({
      type: RESOLVING_ONE_ISSUE,
    });

    API.resolveIssue(issueId, resolvedType)
      .then(resp => {
        if (resp.status === 200) {
          successNotification('Issue marked as resolved.');
          return dispatch(getIssuesWithUnscheduledActions());
        }
        dispatch({
          type: RESOLVING_ONE_ISSUE_SUCCESS,
        });
      })
      .catch(err =>
        dispatch({
          type: RESOLVING_ONE_ISSUE_FAILURE,
        }),
      );
  };
}

export function deleteIssueInvoice(issueId) {
  return dispatch => {
    dispatch({
      type: FETCHING_INVOICE,
    });

    API.deleteIssueInvoice(issueId)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch(getIssueInvoice(issueId));
        }
      })
      .catch(err =>
        dispatch({
          type: FETCHING_INVOICE_FAILURE,
        }),
      );
  };
}

export function deleteIssueEstimate(issueId) {
  return dispatch => {
    dispatch({
      type: FETCHING_ESTIMATE,
    });

    API.deleteEstimate(issueId)
      .then(resp => {
        if (resp.status === 200) {
          return dispatch(getIssueEstimate(issueId));
        }
      })
      .catch(err =>
        dispatch({
          type: FETCHING_ESTIMATE_FAILURE,
        }),
      );
  };
}
