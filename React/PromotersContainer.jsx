import React from "react";
import * as promotersService from "../../../../services/promotersService";
import Styles from "../Promotion.module.css";
import logger from "../../../../logger";
import { Helmet } from "react-helmet";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../Carousel.css";
import PropTypes from "prop-types";

const _logger = logger.extend("PromotersContainer");

    const settings = {
      className: "center",
      centerMode: false,
      infinite: true,
      slidesToShow: 1,
      speed: 500,
      rows: 2,
      slidesPerRow: 3,
      dots: true,
      lazyLoad: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            infinite: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            infinite: true,
            rows: 3,
            slidesPerRow: 1
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            infinite: true,
            rows: 3,
            slidesPerRow: 1
          }
        }
      ]
    };

export default class PromotersContainer extends React.PureComponent {

  componentDidMount() {
    this.loadPage();
  }

  loadPage = () => {
    this.getPagedPromoters();
  };

  getPagedPromoters = () => {
    promotersService
      .publicPaginated(0)
      .then(this.pagedSuccess)
      .catch(this.axiosError);
  };

  pagedSuccess = data => {
    _logger(data);
    const publicPaged = data.item.pagedItems;
    const publicComps = publicPaged.map(this.mapComp);
    this.setState({ publicPaged, publicComps });
  };

  mapComp = el => {
    return (
      <div className="col-md-4" key={el.id}>
        <div className={Styles.promoterCard}>
          <img
            src={el.mainImage}
            alt="Promoter"
            className={Styles.promoterImage}
            id={el.id}
            onClick={this.toPromoter}
          />
          <div
            className={Styles.promoterText}
            id={el.id}
            onClick={this.toPromoter}
          >
            <p>{el.shortDescription}</p>
          </div>
        </div>
      </div>
    );
  };

  toPromoter = e => {
    debugger;
    this.props.history.push("/promoters/" + e.target.id);
  };

  axiosError = data => _logger(data);

  render() {
    return (
      <div className="row">
        <Helmet>
          <title>Seller&apos;s Place Events Los Angeles</title>
        </Helmet>
        <div className="col-xl-12">
          <div className={Styles.promotersContainer}>
            <div className={Styles.alignCenter}>
              <h1 className={Styles.darkText}>Meet the Promoters!</h1>
            </div>
            <div className="col-12">
              <Slider {...settings}>{this.state.publicComps}</Slider>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PromotersContainer.propTypes = {
  history: PropTypes.shape({
	  match: PropTypes.shape({
		  id: PropTypes.string
	  })
  })
};
