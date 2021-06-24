import {
  FETCHING_AMP_GROUPS_MAPPING,
  FETCHING_AMP_GROUPS_MAPPING_FAILURE,
  FETCHING_AMP_GROUPS_MAPPING_SUCCESS,
} from '../constants';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_AMP_GROUPS_MAPPING: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_AMP_GROUPS_MAPPING_SUCCESS: {
      return {
        data: action.payload,
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHING_AMP_GROUPS_MAPPING_FAILURE: {
      return {
        ...initialState,
        // data: action.payload,
      };
    }

    default:
      return state;
  }
};
