import {
  FETCHING_UNSCHEDULED_ISSUES,
  FETCHING_UNSCHEDULED_ISSUES_FAILURE,
  FETCHING_UNSCHEDULED_ISSUES_SUCCESS,
} from '../constants';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_UNSCHEDULED_ISSUES: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_UNSCHEDULED_ISSUES_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }

    case FETCHING_UNSCHEDULED_ISSUES_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
