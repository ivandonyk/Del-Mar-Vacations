import {
  FETCHING_HISTORY,
  FETCHING_HISTORY_FAILURE,
  FETCHING_HISTORY_SUCCESS,
} from '../constants';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
  error: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_HISTORY:
      return { data: [], isFetching: true, fetched: false };
    case FETCHING_HISTORY_SUCCESS:
      return { data: action.payload, isFetching: false, fetched: true };
    case FETCHING_HISTORY_FAILURE:
      return {
        ...initialState,
        error: action.payload,
      };
    default:
      return state;
  }
};
