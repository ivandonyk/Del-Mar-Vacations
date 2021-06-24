import {
  FETCHING_ACTIVE_PROPERTIES,
  FETCHING_ACTIVE_PROPERTIES_FAILURE,
  FETCHING_ACTIVE_PROPERTIES_SUCCESS,
} from '../constants';
import _ from 'lodash';
import Utils from '../helpers/utils';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_ACTIVE_PROPERTIES: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_ACTIVE_PROPERTIES_SUCCESS: {
      return {
        data: _.sortBy(
          [...Utils.merge(state.data, action.payload)],
          'houseNum',
        ),
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHING_ACTIVE_PROPERTIES_FAILURE: {
      return {
        ...initialState,
        data: action.payload,
      };
    }

    default:
      return state;
  }
};
