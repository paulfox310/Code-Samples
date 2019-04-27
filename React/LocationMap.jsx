import React from "react";
import GoogleMapReact from "google-map-react";
import PropTypes from "prop-types";

const MarkerComponent = () => (
  <div>
    <em className="fa-2x mr-2 fas fa-map-pin" />
  </div>
);

function LocationMap(props) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: props.gapiKey }}
        defaultCenter={props.center}
        defaultZoom={props.zoom}
      >
        <MarkerComponent lat={props.center.lat} lng={props.center.lng} />
      </GoogleMapReact>
    </div>
  );
}

LocationMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }).isRequired,
  zoom: PropTypes.number.isRequired,
  gapiKey: //protected
};

export default React.memo(LocationMap);
