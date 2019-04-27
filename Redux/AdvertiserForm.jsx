import React from "react";
import { toast } from "react-toastify";
import {
  setAdvertiserFormData,
  postAdvertiser,
  updateAdvertiser
} from "../../state/actions/AdvertiserActions";
import { connect } from "react-redux";

class AdvertiserForm extends React.PureComponent {
  handleChange = e => {
    let formData = { ...this.props.formData };
    formData[e.target.name] = e.target.value;
    this.props.setAdvertiserFormData(formData);
  };

  handleMetaChange = e => {
    let formData = { ...this.props.formData };
    formData.metaData[e.target.name] = e.target.value;
    this.props.setAdvertiserFormData(formData);
  };

  handleSubmit = () => {
    if (!this.props.match.params.id) {
      this.props.postAdvertiser(this.props.formData);
    } else {
      this.props.updateAdvertiser(this.props.formData);
    }
    this.props.history.push("/advertisers");
  };

  render() {
    return (
      <div>
        <form>
          <div className="form-group row">
            <label className="col-4 col-form-label" htmlFor="name">
              Name
            </label>
            <div className="col-8">
              <input
                id="name"
                name="name"
                placeholder="Advertiser Name"
                type="text"
                className="form-control"
                value={this.props.formData.name}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="headline" className="col-4 col-form-label">
              Headline
            </label>
            <div className="col-8">
              <input
                id="headline"
                name="headline"
                placeholder="Headline"
                type="text"
                className="form-control"
                value={this.props.formData.headline}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="slug" className="col-4 col-form-label">
              Slug
            </label>
            <div className="col-8">
              <input
                id="slug"
                name="slug"
                placeholder="Slug"
                type="text"
                className="form-control"
                value={this.props.formData.slug}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="primaryImage" className="col-4 col-form-label">
              Primary Image
            </label>
            <div className="col-8">
              <input
                id="primaryImage"
                name="primaryImage"
                placeholder="Image URL"
                type="text"
                className="form-control"
                value={this.props.formData.primaryImage}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="content" className="col-4 col-form-label">
              Content
            </label>
            <div className="col-8">
              <textarea
                id="content"
                name="content"
                cols="40"
                rows="3"
                className="form-control"
                value={this.props.formData.content}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="address" className="col-4 col-form-label">
              Address
            </label>
            <div className="col-8">
              <input
                id="address"
                name="address"
                placeholder="Address"
                type="text"
                className="form-control"
                value={this.props.formData.metaData.address}
                onChange={this.handleMetaChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="zip" className="col-4 col-form-label">
              Zip Code
            </label>
            <div className="col-8">
              <input
                id="zip"
                name="zip"
                placeholder="Postal Code"
                type="text"
                className="form-control"
                value={this.props.formData.metaData.zip}
                onChange={this.handleMetaChange}
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="offset-4 col-8">
              <button
                onClick={this.handleSubmit}
                name="submit"
                type="button"
                className="btn btn-primary"
              >
                {!this.props.match.params.id ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    formData: state.AdvertiserReducer.formData
  };
};

const mapDispatchToProps = {
  setAdvertiserFormData,
  postAdvertiser,
  updateAdvertiser
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvertiserForm);
