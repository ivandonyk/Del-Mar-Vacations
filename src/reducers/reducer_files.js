import {
  DELETING_FILE,
  DELETING_FILES_SUCCESS,
  DEASSOCIATING_FILE_SUCCESS,
  DELETING_FILES_FAILURE,
  FETCHED_FILES_FAILURE,
  FETCHED_FILES_SUCCESS,
  FETCHING_FILES,
  FLUSH_FILES,
} from '../constants';
import _ from 'lodash';

const initialState = {
  data: [],
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_FILES: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case DELETING_FILE: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHED_FILES_SUCCESS: {
      /**
       * Always keep number of file objects stored
       * 100 or below for memory reasons
       */
      const data = [].concat(state.data);
      if (data.length > 100) {
        while (data.length > 100) {
          data.shift();
        }
      }

      const concatenated = [].concat(data, action.payload);
      const skimmed = _.uniqBy(concatenated, 'id');
      return {
        data: skimmed,
        isFetching: false,
        fetched: true,
      };
    }
    case DELETING_FILES_SUCCESS: {
      const filtered = state.data.filter(d => d.key !== action.payload);
      return {
        data: filtered,
        isFetching: false,
        fetched: true,
      };
    }
    case DEASSOCIATING_FILE_SUCCESS: {
      let id = action.payload;
      const filtered = state.data.filter(d => d.id !== id);
      return {
        data: filtered,
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHED_FILES_FAILURE: {
      return {
        ...initialState,
        data: state.data,
      };
    }
    case DELETING_FILES_FAILURE: {
      return {
        ...initialState,
        data: state.data,
      };
    }
    case FLUSH_FILES: {
      let data = state.data;
      data = data.filter(d => (
        d.table_name !== action.payload
      ));

      return {
        data
      };
    }

    default:
      return state;
  }
};
