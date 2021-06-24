import {
  UPLOADED_FILE_FAILURE,
  UPLOADED_FILE_SUCCESS,
  UPLOADING_FILE,
} from '../constants';

const initialState = {
  uploading: false,
  uploaded: false,
  error: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPLOADING_FILE: {
      return {
        uploading: true,
        uploaded: false,
      };
    }
    case UPLOADED_FILE_SUCCESS: {
      return {
        uploaded: true,
        uploading: false,
      };
    }
    case UPLOADED_FILE_FAILURE: {
      return {
        ...initialState,
        error: action.payload,
      };
    }

    default:
      return state;
  }
};
