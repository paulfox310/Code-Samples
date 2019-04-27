const AdvertiserReducer = (
  state = {
    currentAdvertiser: {},
    formData: {
      name: "",
      headline: "",
      primaryImage: "",
      slug: "",
      content: "",
      metaData: {
        address: "",
        zip: ""
      }
    },
    advertisers: [],
    postReturn: {}
  },
  action
) => {
  switch (action.type) {
    case "SET_CURRENT_ADVERTISER":
      state = {
        ...state,
        currentAdvertiser: action.payload
      };
      break;
    case "SET_ADVERTISER_FORMDATA":
      state = {
        ...state,
        formData: action.payload
      };
      break;
    case "POST_ADVERTISER":
      state = {
        ...state,
        formData: {
          name: "",
          headline: "",
          primaryImage: "",
          slug: "",
          content: "",
          metaData: {
            address: "",
            zip: ""
          }
        },
        postReturn: action.payload
      };
      break;
    case "UPDATE_ADVERTISER":
      state = {
        ...state,
        formData: {
          name: "",
          headline: "",
          primaryImage: "",
          slug: "",
          content: "",
          metaData: {
            address: "",
            zip: ""
          }
        },
        updateReturn: action.payload
      };
      break;
    case "SET_ADVERTISERS_ARRAY":
      state = {
        ...state,
        advertisers: action.payload
      };
      break;
    case "CLEAR_FORMDATA":
      state = {
        ...state,
        formData: {
          name: "",
          headline: "",
          primaryImage: "",
          slug: "",
          content: "",
          metaData: {
            address: "",
            zip: ""
          }
        }
      };
      break;
    default:
  }
  return state;
};

export default AdvertiserReducer;
