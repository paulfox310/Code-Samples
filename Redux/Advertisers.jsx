import React from "react";
import { toast } from "react-toastify";
import AdvertiserCard from "./AdvertiserCard";
import { connect } from "react-redux";
import {
  setAdvertiser,
  getAdvertisers,
  setAdvertiserFormData,
  clearForm,
  deleteAdvertiser
} from "../../state/actions/AdvertiserActions";

class Advertisers extends React.Component {
  componentDidMount() {
    this.props.getAdvertisers();
  }

  componentizeData = array => array.map(this.mapComponents);

  mapComponents = el => (
    <AdvertiserCard
      key={el.id}
      advertiser={el}
      handleClick={this.viewAdvertiser}
      handleEditClick={this.editAdvertiser}
      handleDelete={this.deleteAdvertiser}
    />
  );

  newAdvertiser = () => {
    toast("Let's make a new Advertiser!");
    this.props.clearForm();
    this.props.history.push("/advertisers/new");
  };

  viewAdvertiser = e => {
    toast("Check Redux!");
    const advertisers = [...this.props.advertisers];
    let index = advertisers.findIndex(obj => e.target.id == obj.id);
    this.props.history.push("/advertisers/" + e.target.id);
    this.props.setAdvertiser(advertisers[index]);
  };

  editAdvertiser = e => {
    const advertisers = [...this.props.advertisers];
    let index = advertisers.findIndex(obj => e.target.id == obj.id);
    this.props.history.push("/advertisers/" + e.target.id + "/edit");
    this.props.setAdvertiserFormData(advertisers[index]);
  };

  deleteAdvertiser = e => {
    const advertisers = [...this.props.advertisers];
    let index = advertisers.findIndex(obj => e.target.id == obj.id);
    let id = advertisers[index].id;
    advertisers.splice(index, 1);
    this.props.deleteAdvertiser(advertisers, id);
  };

  render() {
    return (
      <div>
        <button
          type="button"
          className="btn btn-primary sm"
          onClick={this.newAdvertiser}
        >
          Add Advertiser
        </button>
        <div className="mt-2 row">
          {this.props.advertisers &&
            this.props.advertisers.map(this.mapComponents)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    advertisers: state.AdvertiserReducer.advertisers
  };
};

const mapDispatchToProps = {
  setAdvertiser,
  getAdvertisers,
  setAdvertiserFormData,
  clearForm,
  deleteAdvertiser
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Advertisers);
