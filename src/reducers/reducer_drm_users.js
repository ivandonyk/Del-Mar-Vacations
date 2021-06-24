import {
  FETCHING_DRM_USERS,
  FETCHING_DRM_USERS_FAILURE,
  FETCHING_DRM_USERS_SUCCESS,
} from '../constants';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_DRM_USERS: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_DRM_USERS_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHING_DRM_USERS_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
