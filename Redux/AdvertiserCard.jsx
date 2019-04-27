import React from "react";
import "./Advertisers.css";

function ABCPermitCard(props) {
  return (
    <div className="col-lg-4">
      <div className="card mb-3 border-primary">
        <div className="card-header text-white bg-primary">
          {props.advertiser.name}
        </div>
        <div className="card-body">
          <p className="card-text">{props.advertiser.headline}</p>
          <p className="card-text">{props.advertiser.slug}</p>
        </div>
        <div className="card-footer">
          <button
            onClick={props.handleClick}
            className="myButton"
            id={props.advertiser.id}
            type="button"
          >
            View More
          </button>
          <button
            className="float-right myDeleteButton"
            type="button"
            onClick={props.handleDelete}
            id={props.advertiser.id}
          >
            Delete
          </button>
          <button
            onClick={props.handleEditClick}
            className="float-right myButton mr-2"
            id={props.advertiser.id}
            type="button"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ABCPermitCard);
