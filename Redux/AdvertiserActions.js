import * as _service from "../../services/advertiserService";

export const setAdvertiser = data => ({
  type: "SET_CURRENT_ADVERTISER",
  payload: data
});

export const setAdvertiserFormData = data => ({
  type: "SET_ADVERTISER_FORMDATA",
  payload: data
});

const dispatchAdvertisers = items => {
  return {
    type: "SET_ADVERTISERS_ARRAY",
    payload: items
  };
};

export const getAdvertisers = () => {
  return dispatch => {
    dispatch(dispatchAdvertisers());
    return _service
      .read()
      .then(data => data.data.data)
      .then(items => dispatch(dispatchAdvertisers(items)));
  };
};

const dispatchPost = data => {
  return {
    type: "POST_ADVERTISER",
    payload: data
  };
};

export const postAdvertiser = data => {
  return dispatch => {
    dispatch(dispatchPost());
    return _service
      .create(data)
      .then(response => dispatch(dispatchPost(response.data.data)));
  };
};

export const clearForm = () => {
  return {
    type: "CLEAR_FORMDATA"
  };
};

const dispatchUpdate = data => {
  return {
    type: "UPDATE_ADVERTISER",
    payload: data
  };
};

export const updateAdvertiser = data => {
  return dispatch => {
    dispatch(dispatchUpdate());
    return _service
      .update(data)
      .then(response => dispatch(dispatchUpdate(response.data.data)));
  };
};

export const deleteAdvertiser = (items, id) => {
  debugger;
  return dispatch => {
    dispatch(dispatchAdvertisers());
    return _service
      .deleteAdvertiser(id)
      .then(() => dispatch(dispatchAdvertisers(items)));
  };
};
