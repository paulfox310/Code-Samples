import React from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import logger from "../../logger";
import ContentWrapper from "../layout/ContentWrapper";
import EditSpaceModal from "./EditSpaceModal";
import * as floorPlanService from "../../services/floorPlanService";
import * as spacesService from "../../services/spacesService";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import "./FloorPlan.css";

//This page was worked on in coordination with Claire Hong @ClaireHong11

const _logger = logger.extend("CreateFloorPlan");

class CreateFloorPlan extends React.PureComponent {
  state = {
    spacesData: [],
    layout: [],
    compsArray: [],
    modal: false,
    spaceTypes: [],
    spaceTypeBtns: [],
    selectedSpace: {}
  };

  componentDidMount() {
    spacesService
      .getAllByUserIdSpaceType()
      .then(this.setSpaceTypes)
      .catch(() => _logger("error getting space types"));
  }

  setSpaceTypes = data => {
    let spaceTypes = data.items;
    let spaceTypeBtns = spaceTypes.map(this.mapButtons);
    this.setState({ spaceTypes, spaceTypeBtns });
  };

  mapButtons = spaceType => {
    return (
      <button
        className="btn btn-primary btn-xs mr-2"
        id={spaceType.id}
        key={spaceType.id}
        onClick={this.onAddItem}
      >
        {"Add " + spaceType.name}
      </button>
    );
  };

  onAddItem = event => {
    let spaceId = new Date().getTime();
    let spaceTypeId = Number(event.target.id);
    let typeIndex = this.searchForIndex(this.state.spaceTypes, spaceTypeId);
    let spaceType = this.state.spaceTypes[typeIndex];

    let counter = 0;
    let layout = this.state.layout;
    let arr = [];
    for (let i = 0; i < layout.length; i++) {
      if (layout[i].x === 0) {
        let y = layout[i].y;
        arr.push(y);
      }
    }
    for (let j = 0; j < arr.length; ) {
      if (counter === arr[j]) {
        counter += 2;
        j = 0;
      } else {
        j++;
      }
    }

    let updater = prevState => {
      let newSpacePosition = {
        id: spaceId,
        x: 0,
        y: counter,
        w: 1,
        h: 2
      };
      let newSpaceData = {
        id: spaceId,
        typeId: spaceTypeId,
        name: spaceType.name,
        description: spaceType.description || "",
        cost: spaceType.cost,
        isAvailable: true,
        isSold: false
      };

      let newComp = this.makeDiv("bg-info", newSpacePosition, newSpaceData);
      let spacesData = prevState.spacesData.concat([newSpaceData]);
      let compsArray = prevState.compsArray.concat([newComp]);

      return {
        spacesData,
        compsArray
      };
    };
    this.setState(updater);
  };

  updateSpace = (newColor, formData) => {
    let compsArray = [...this.state.compsArray];
    for (let i = 0; i < compsArray.length; i++) {
      if (compsArray[i].props.id === formData.id) {
        let color = compsArray[i].props.className;
        if (newColor) {
          color = newColor;
        }
        compsArray[i] = this.makeDiv(
          color,
          compsArray[i].props["data-grid"],
          formData
        );
      }
    }
    let spacesData = [...this.state.spacesData];
    let index = this.searchForIndex(spacesData, formData.id);
    spacesData[index] = formData;

    let layout = [...this.state.layout];
    for (let i = 0; i < layout.length; i++) {
      if (layout[i].i === formData.id.toString()) {
        let newLayout = {
          i: layout[i].i,
          w: layout[i].w,
          h: layout[i].h,
          x: layout[i].x,
          y: layout[i].y
        };
        if (formData.isAvailable) {
          newLayout.static = false;
        } else {
          newLayout.static = true;
        }
        layout[i] = newLayout;
      }
    }
    this.toggle({
      compsArray,
      spacesData,
      layout
    });
  };

  makeDiv = (color, spacePosition, spaceData) => {
    const id = spaceData.id;
    if (spaceData.isAvailable) {
      spacePosition.static = false;
    } else {
      spacePosition.static = true;
    }
    return (
      <div key={id} data-grid={spacePosition} id={id} className={color}>
        <div
          id={id}
          className="space-name text-center"
          onContextMenu={this.onRightClick}
        >
          {spaceData.name}
          <br />
          {"$" + spaceData.cost}
        </div>
        {spaceData.isAvailable ? (
          <div>
            <i
              className="fas fa-times remove-icon"
              onClick={this.onRemoveItem.bind(this, id)}
            />
            <i
              className="fas fa-cog gear-icon"
              onClick={this.handleSettings.bind(this, id)}
            />
          </div>
        ) : !spaceData.isAvailable && !spaceData.isSold ? (
          <span>
            <i
              className="fas fa-cog gear-icon"
              onClick={this.handleSettings.bind(this, id)}
            />
            <i className="fa fa-lock lock-icon" />
          </span>
        ) : (
          <i className="fa fa-lock lock-icon" />
        )}
      </div>
    );
  };

  onRemoveItem = id => {
    let spacesData = [...this.state.spacesData];
    let compsArray = [...this.state.compsArray];
    let index = this.searchForIndex(spacesData, id);
    if (index >= 0) {
      spacesData.splice(index, 1);
      compsArray.splice(index, 1);
      this.setState({ spacesData, compsArray });
    }
  };

  handleSettings = id => {
    let spacesData = [...this.state.spacesData];
    let index = this.searchForIndex(spacesData, id);
    if (index >= 0) {
      this.toggle({ selectedSpace: spacesData[index] });
    }
  };

  onRightClick = e => {
    e.preventDefault();
    let spacesData = [...this.state.spacesData];
    let id = Number(e.target.id);
    let index = this.searchForIndex(spacesData, id);
    this.toggle({
      selectedSpace: spacesData[index]
    });
  };

  createFloorPlan = () => {
    let eventId = this.props.match.params.eventId;
    let spacesData = this.state.spacesData;
    let spacesLayout = this.state.layout;
    let divsArray = this.state.compsArray;

    for (let i = 0; i < spacesData.length; i++) {
      for (let j = 0; j < spacesLayout.length; j++) {
        for (let k = 0; k < divsArray.length; k++) {
          if (
            spacesData[i].id === Number(spacesLayout[j].i) &&
            Number(spacesLayout[j].i) === divsArray[k].props.id
          ) {
            spacesData[i].metaData = JSON.stringify({
              layout: spacesLayout[j],
              layoutDivs: divsArray[k]
            });
          }
        }
      }
    }

    let payload = {
      eventId: eventId,
      isLocked: false,
      hasSoldItems: false,
      space: spacesData
    };
    _logger(payload);
    floorPlanService
      .createFloorPlan(payload)
      .then(() => toast("Floor plan created successfully!"))
      .catch(() => toast("Error creating floor plan."));
  };

  searchForIndex = (array, value) => {
    for (let j = 0; j < array.length; j++) {
      if (array[j].id === value) {
        return j;
      }
    }
    return -1;
  };

  toggle = xtr => {
    xtr = xtr || {};
    this.setState(prevState => {
      xtr.modal = !prevState.modal;
      return xtr;
    });
  };

  onLayoutChange = layout => {
    this.setState({ layout });
  };

  createSpaceType = () => {
    this.props.history.push("/admin/spaces");
  };

  render() {
    return (
      <ContentWrapper>
        {this.state.spaceTypeBtns}
        <div className="float-right">
          <button
            type="button"
            className="btn btn-primary btn-xs mr-2"
            onClick={this.createSpaceType}
          >
            Add Space Type
          </button>
          <button
            className="btn btn-primary btn-xs"
            onClick={this.createFloorPlan}
          >
            Create Floor Plan
          </button>
        </div>
        <div className="grid-overflow">
          <GridLayout
            cols={24}
            width={2000}
            rowHeight={30}
            compactType={null}
            preventCollision={true}
            isResizable={true}
            layout={this.state.layout}
            onLayoutChange={this.onLayoutChange}
          >
            {this.state.compsArray}
          </GridLayout>
        </div>
        {this.state.modal && (
          <EditSpaceModal
            toggle={this.toggle}
            updateSpace={this.updateSpace}
            selectedSpace={this.state.selectedSpace}
          />
        )}
      </ContentWrapper>
    );
  }
}

CreateFloorPlan.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
		eventId: PropTypes.string
	})
  }),
  history: PropTypes.object
};

export default CreateFloorPlan;
