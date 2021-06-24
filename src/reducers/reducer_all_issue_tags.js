import {
  FETCHING_ISSUE_TAGS,
  FETCHING_ISSUE_TAGS_FAILURE,
  FETCHING_ISSUE_TAGS_SUCCESS,
} from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_ISSUE_TAGS: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_ISSUE_TAGS_SUCCESS: {
      return {
        data: {
          ...state.data,
          ...action.payload,
        },
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHING_ISSUE_TAGS_FAILURE: {
      return {
        ...initialState,
        data: action.payload,
      };
    }

    default:
      return state;
  }
};
