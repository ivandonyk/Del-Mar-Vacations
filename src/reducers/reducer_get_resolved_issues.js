import {
  FETCHING_RESOLVED_ISSUES,
  FETCHING_RESOLVED_ISSUES_FAILURE,
  FETCHING_RESOLVED_ISSUES_SUCCESS,
} from '../constants';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_RESOLVED_ISSUES: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_RESOLVED_ISSUES_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }

    case FETCHING_RESOLVED_ISSUES_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
