import React from "react";
import logger from "../../logger";
import { Formik, Form, Field } from "formik";
import * as filesService from "../../services/filesService";
import * as userProfilesService from "../../services/userProfilesService";
import * as schemas from "./schemas/schemasUSP";
import "./userProfile.css";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const _logger = logger.extend("ContactInfoForm");

export default class ContactInfoForm extends React.PureComponent {
  state = {
    currentProfile: {
      email: "",
      firstName: "",
      id: "",
      lasName: "",
      profileImage: "",
      phoneNumber: "",
      roles: [],
      urls: [],
      userId: ""
    },
    facebook: {},
    instagram: {},
    twitter: {},
    targetSchema: schemas.addSchema
  };

  componentDidMount() {
    this.handleLoad();
  }

  loadPage = data => {
    _logger(data);
    const currentProfile = data.item;
    let facebook = null;
    let twitter = null;
    let instagram = null;
    if (data.item.urls && data.item.urls.length > 0) {
      facebook = data.item.urls.find(this.isFacebook);
      twitter = data.item.urls.find(this.isTwitter);
      instagram = data.item.urls.find(this.isInstagram);
    }
    const isAdmin = data.item.roles.find(this.isAdmin);
    const isVenueOwner = data.item.roles.find(this.isVenueOwner);
    const isVendor = data.item.roles.find(this.isVendor);
    const isPromoter = data.item.roles.find(this.isPromoter);
    const formData = {};
    formData.firstName = data.item.firstName;
    formData.lastName = data.item.lastName;
    formData.phoneNumber = data.item.phoneNumber;
    if (twitter) {
      formData.twitter = twitter.url;
    }
    if (facebook) {
      formData.facebook = facebook.url;
    }
    if (instagram) {
      formData.instagram = instagram.url;
    }
    this.setState({
      currentProfile,
      facebook,
      twitter,
      instagram,
      isAdmin,
      isVenueOwner,
      isVendor,
      isPromoter,
      formData
    });
  };

  changeImage = () => {
    _logger("Testing");
  };

  handleLoad = () => {
    userProfilesService
      .getById(this.props.match.params.id)
      .then(this.loadPage)
      .catch(this.onError);
  };

  handleTextChange = e => {
    let formData = { ...this.state.formData };
    formData[e.target.name] = e.target.value;
    this.setState({ formData });
  };

  isFacebook = url => url.urlTypeId === 1;
  isTwitter = url => url.urlTypeId === 2;
  isInstagram = url => url.urlTypeId === 3;
  isAdmin = role => role === 1;
  isVenueOwner = role => role === 2;
  isVendor = role => role === 3;
  isPromoter = role => role === 4;

  handleUpload = event => {
    const data = new FormData();
    for (let i = 0; i < event.target.files.length; i++) {
      data.append("files", event.target.files[i]);
    }

    filesService
      .uploadFile(data)
      .then(this.onSuccess)
      .catch(function() {
        _logger("ERROR with files");
      });
  };

  onSuccess = data => {
    _logger("imageUrl: " + data.item[0].url);
    this.getImageUrl(data);
  };

  getImageUrl = data => {
    this.setState(prevState => {
      let imageUrl = prevState.imageUrl;
      imageUrl = data.item[0].url;
      return { imageUrl };
    });
  };

  onSubmitForm = (values, actions) => {
    const payload = this.formPaylod(values);
    userProfilesService
      .update(payload)
      .then(this.updateSuccess)
      .then(this.handleLoad)
      .catch(this.onError);

    actions.setSubmitting(false);
  };

  updateSuccess = data => {
    toast("Profile successfully updated!");
    return data;
  };

  formPaylod = values => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      id: this.state.currentProfile.userId,
      urls: []
    };
    if (values.facebook) {
      payload.urls.push({ url: values.facebook, entityType: 1 });
    }
    if (values.twitter) {
      payload.urls.push({ url: values.twitter, entityType: 2 });
    }
    if (values.instagram) {
      payload.urls.push({ url: values.instagram, entityType: 3 });
    }
    if (this.state.imageUrl) {
      payload.profileImage = this.state.imageUrl;
    } else {
      payload.profileImage = this.state.currentProfile.profileImage;
    }
    return payload;
  };

  onError = data => {
    _logger(data);
    toast.error("Oh no! Something went wrong!");
  };

  render() {
    return (
      <div className="content-wrapper">
        <div className="row">
          <div className="col-lg-4">
            <div className="card card-default">
              <div className="card-body text-center">
                <div className="py-4">
                  <label htmlFor="file-upload">
                    {this.state.currentProfile.profileImage &&
                      !this.state.imageUrl && (
                        <img
                          className="img-fluid rounded-circle img-thumbnail thumb96 profile-pic"
                          src={this.state.currentProfile.profileImage}
                          alt="Contact"
                        />
                      )}
                    {this.state.imageUrl && (
                      <img
                        className="img-fluid rounded-circle img-thumbnail thumb96 profile-pic"
                        src={this.state.imageUrl}
                        alt="Contact"
                      />
                    )}
                    {!this.state.imageUrl &&
                      !this.state.currentProfile.profileImage && (
                        <img
                          className="img-fluid rounded-circle img-thumbnail thumb96 profile-pic"
                          src="//removed"
                          alt="Contact"
                        />
                      )}
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    style={{ display: "none" }}
                    onChange={this.handleUpload}
                  />
                </div>
                {this.state.currentProfile && (
                  <h3 className="m-0 text-bold">
                    {this.state.currentProfile.firstName}{" "}
                    {this.state.currentProfile.lastName}
                  </h3>
                )}
                <div className="my-3">
                  <p>
                    <i
                      className="fa fa-envelope right-pad"
                      aria-hidden="true"
                    />
                    {this.state.currentProfile.email}
                  </p>
                </div>
                <div className="my-3">
                  <p>
                    <i className="fas fa-phone right-pad" />
                    {this.state.currentProfile.phoneNumber}
                  </p>
                </div>

                <div>
                  {this.state.instagram ? (
                    <a
                      title="Instagram"
                      href={this.state.instagram.url}
                      target={"_blank"}
                      rel="noopener nonreferrer"
                    >
                      <i className="fa-2x mr-2 fab fa-instagram" />
                    </a>
                  ) : (
                    <i className="fa-2x mr-2 fab fa-instagram" />
                  )}
                  {this.state.twitter ? (
                    <a
                      title="Twitter"
                      href={this.state.twitter.url}
                      target={"_blank"}
                      rel="noopener nonreferrer"
                    >
                      <i className="fa-2x mr-2 fab fa-twitter" />
                    </a>
                  ) : (
                    <i className="fa-2x mr-2 fab fa-twitter" />
                  )}
                  {this.state.facebook ? (
                    <a
                      title="Facebook"
                      href={this.state.facebook.url}
                      target={"_blank"}
                      rel="noopener nonreferrer"
                    >
                      <i className="fa-2x mr-2 fab fa-facebook-f" />
                    </a>
                  ) : (
                    <i className="fa-2x mr-2 fab fa-facebook-f" />
                  )}
                </div>
                {this.state.currentProfile.roles.length > 0 && (
                  <div className="padding-top">
                    {this.state.isPromoter && (
                      <em className="fa-2x mr-2 fa fa-bullhorn" />
                    )}
                    {this.state.isVenueOwner && (
                      <em className="fa-2x mr-2 far fa-building" />
                    )}
                    {this.state.isVendor && (
                      <em className="fa-2x icon-briefcase mr-2" />
                    )}
                    {this.state.isAdmin && (
                      <em className="fa-2x mr-2 fas fa-gem" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card card-default">
              <div className="card-header d-flex align-items-center">
                <div className="d-flex justify-content-center col">
                  <div className="h4 m-0 text-center">Contact Information</div>
                </div>
              </div>
              <div className="card-body">
                <div className="row py-4 justify-content-center">
                  <div className="col-12 col-sm-10">
                    <Formik
                      enableReinitialize={true}
                      validationSchema={this.state.targetSchema}
                      initialValues={this.state.formData}
                      onSubmit={this.onSubmitForm}
                    >
                      {props => {
                        const {
                          touched,
                          errors,
                          handleBlur,
                          handleSubmit,
                          isSubmitting
                        } = props;
                        return (
                          <div>
                            <Form
                              onSubmit={handleSubmit}
                              className="form-horizontal"
                            >
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact1"
                                >
                                  First Name
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <Field
                                    type="text"
                                    placeholder=""
                                    name="firstName"
                                    onBlur={handleBlur}
                                    className={
                                      errors.firstName && touched.firstName
                                        ? "form-control error"
                                        : "form-control"
                                    }
                                  />
                                  {errors.firstName && touched.firstName && (
                                    <span className="input-feedback text-danger">
                                      {errors.firstName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact1"
                                >
                                  Last Name
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <Field
                                    type="text"
                                    placeholder=""
                                    name="lastName"
                                    onBlur={handleBlur}
                                    className={
                                      errors.lastName && touched.lastName
                                        ? "form-control error"
                                        : "form-control"
                                    }
                                  />
                                  {errors.lastName && touched.lastName && (
                                    <span className="input-feedback text-danger">
                                      {errors.lastName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact2"
                                >
                                  Email
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <input
                                    className="form-control"
                                    type="email"
                                    placeholder={
                                      this.state.currentProfile.email
                                    }
                                    disabled
                                  />
                                </div>
                              </div>
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact3"
                                >
                                  Phone
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <Field
                                    id="inputContact3"
                                    type="text"
                                    name="phoneNumber"
                                    onBlur={handleBlur}
                                    className={
                                      errors.phoneNumber && touched.phoneNumber
                                        ? "form-control error"
                                        : "form-control"
                                    }
                                  />
                                  {errors.phoneNumber &&
                                    touched.phoneNumber && (
                                      <span className="input-feedback text-danger">
                                        {errors.phoneNumber}
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact7"
                                >
                                  <em className="fa-2x icon-social-instagram mr-2" />
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <Field
                                    id="inputContact7"
                                    type="text"
                                    name="instagram"
                                    className={
                                      errors.instagram && touched.instagram
                                        ? "form-control error"
                                        : "form-control"
                                    }
                                  />
                                  {errors.instagram && touched.instagram && (
                                    <span className="input-feedback text-danger">
                                      {errors.instagram}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact7"
                                >
                                  <em className="fa-2x icon-social-twitter mr-2" />
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <Field
                                    id="inputContact8"
                                    type="text"
                                    name="twitter"
                                    className={
                                      errors.twitter && touched.twitter
                                        ? "form-control error"
                                        : "form-control"
                                    }
                                  />
                                  {errors.twitter && touched.twitter && (
                                    <span className="input-feedback text-danger">
                                      {errors.twitter}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="form-group row">
                                <label
                                  className="text-bold col-xl-2 col-md-3 col-4 col-form-label text-right"
                                  htmlFor="inputContact7"
                                >
                                  <em className="fa-2x icon-social-facebook mr-2" />
                                </label>
                                <div className="col-xl-10 col-md-9 col-8">
                                  <Field
                                    id="inputContact9"
                                    type="text"
                                    name="facebook"
                                    className={
                                      errors.facebook && touched.facebook
                                        ? "form-control error"
                                        : "form-control"
                                    }
                                  />
                                  {errors.facebook && touched.facebook && (
                                    <span className="input-feedback text-danger">
                                      {errors.facebook}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="form-group row">
                                <div className="col-md-10">
                                  <button
                                    className="btn btn-info"
                                    type="submit"
                                    disabled={isSubmitting}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </Form>
                          </div>
                        );
                      }}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ContactInfoForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
		id: PropTypes.string
	})
  })
};
