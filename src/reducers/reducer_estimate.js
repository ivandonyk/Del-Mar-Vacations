import {
  FETCHING_ESTIMATE,
  FETCHING_ESTIMATE_FAILURE,
  FETCHING_ESTIMATE_SUCCESS,
} from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_ESTIMATE: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_ESTIMATE_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }

    case FETCHING_ESTIMATE_FAILURE: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};
