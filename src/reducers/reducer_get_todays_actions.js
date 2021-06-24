import {
  FETCHING_TODAYS_ACTIONS,
  FETCHING_TODAYS_ACTIONS_FAILURE,
  FETCHING_TODAYS_ACTIONS_SUCCESS,
  UPDATING_ONE_ACTION_SUCCESS,
} from '../constants';
const initialState = {
  data: {},
  isFetching: false,
  fetched: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_TODAYS_ACTIONS: {
      return {
        data: state.data,
        isFetching: true,
        fetched: false,
      };
    }
    case FETCHING_TODAYS_ACTIONS_SUCCESS: {
      const actionsData = state.data;
      actionsData[action.payload.day] = action.payload.data;

      return {
        data: {
          ...actionsData,
        },
        isFetching: false,
        fetched: true,
      };
    }
    case FETCHING_TODAYS_ACTIONS_FAILURE: {
      return {
        ...initialState,
      };
    }

    case UPDATING_ONE_ACTION_SUCCESS: {
      const createOrUpdateData = state.data;
      createOrUpdateData[action.payload.day] = createOrUpdateData[
        action.payload.day
      ]
        ? createOrUpdateData[action.payload.day]
        : [];
      const indexData = createOrUpdateData[action.payload.day].findIndex(
        item => item.id === action.payload.data.id,
      );

      let updateData;
      if (indexData > -1) {
        updateData = createOrUpdateData[action.payload.day].map(item => {
          if (item.id === action.payload.data.id) {
            return { ...item, ...action.payload.data };
          }
          return item;
        });
      } else {
        updateData = [
          ...createOrUpdateData[action.payload.day],
          action.payload.data,
        ];
      }

      createOrUpdateData[action.payload.day] = [...updateData];

      return {
        ...state,
        data: {
          ...createOrUpdateData,
        },
      };
    }

    default:
      return state;
  }
};
