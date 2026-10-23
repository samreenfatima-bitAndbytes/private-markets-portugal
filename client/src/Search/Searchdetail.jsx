/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useQuery } from "@tanstack/react-query";
import { React, useState } from "react";
import AnimateHeight from "react-animate-height";
import { Col, Container, Row } from "react-bootstrap";
import { FaAngleDown } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { propertySearchView } from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";

import ContactUs from "./ContactUs";
import "./search.scss";
import { useTranslation } from "react-i18next";
import { truncate } from "../utils/Functions";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loader from "../Loader/Loader";
import PropertyMap from "../components/PropertyMap";
import { mediaUrl } from "../utils/mediaUrl";

function Searchdetail() {
  const [height, setHeight] = useState(0);
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  // const [docs, setDocs] = useState([]);

  const { id } = useParams();
  const { data: viewProperty, isFetching } = useQuery({
    queryKey: ["viewProperty", { id }],
    queryFn: async () => {
      const res = await propertySearchView(id);
      const data = res?.data?.data;
      const coords = data?.location?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        setCenter({
          lat: Number(coords[1]) || 38.7223,
          lng: Number(coords[0]) || -9.1393,
        });
      }
      return data;
    },
    retry: 1,
  });

  let docs = [];
  if (viewProperty?.propertyImgId?.length > 0) {
    viewProperty.propertyImgId.forEach((imgId, index) => {
      const fileType = viewProperty?.fileType?.[index];
      if (fileType !== "application/pdf" && imgId) {
        docs.push({
          uri: mediaUrl(imgId),
        });
      }
    });
  } else if (viewProperty?.image?.length) {
    viewProperty.image.forEach((imgId) => {
      if (imgId) docs.push({ uri: String(imgId).replace(/"/g, "") });
    });
  }

  const [center, setCenter] = useState({
    lat: 76.2169907,
    lng: 30.70707689999999,
  });

  const CustomPrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <span>&lt;</span>
      </div>
    );
  };

  const CustomNextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <span>&gt;</span>
      </div>
    );
  };
  var settings = {
    infinite: docs.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: docs.length > 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  if (isFetching && !viewProperty) {
    return (
      <>
        <Header />
        <Loader />
        <Footer />
      </>
    );
  }

  if (!isFetching && !viewProperty) {
    return (
      <>
        <Header />
        <section className="searchdiv py-5">
          <Container>
            <p className="text-center mb-3">Property not found.</p>
            <div className="text-center">
              <Link className="btn btn-theme2" to="/search">
                Back to search
              </Link>
            </div>
          </Container>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <section className="searchdiv">
        <Container>
          <Row>
            <Col md={8} xl={8}>
              <div className="property-list">
                <div className="property_list_item mt-0 pt-0">
                  <div className="single_property_text">
                    <div className="detail-info sidebox mb-4 pt-0">
                      <div className="imageout">
                        {viewProperty?.categoryId == "Business" ? (
                          <picture className="main-image main-image-desktop horizontal-img false-panoramic image-loaded">
                            <div className="main-image_first">
                              <img
                                src="/business.jpg"
                                width="50px"
                                height="50px"
                                alt="Default Image"
                              />
                            </div>
                          </picture>
                        ) : (
                          <picture className="main-image main-image-desktop horizontal-img false-panoramic image-loaded">
                            <div className="main-image_first">
                              {docs.length > 0 ? (
                                <Slider {...settings}>
                                  {docs.map((data, i) => (
                                    <div className="property-img" key={i}>
                                      <img
                                        className="w-100"
                                        src={data.uri}
                                        alt={`Property photo ${i + 1}`}
                                      />
                                    </div>
                                  ))}
                                </Slider>
                              ) : (
                                <div className="property-img">
                                  <img
                                    className="w-100"
                                    src="/property.jpg"
                                    alt="No property photos"
                                  />
                                </div>
                              )}
                            </div>
                          </picture>
                        )}
                      </div>
                      {viewProperty?.categoryId == "Business" ? (
                        <>
                          <div className="detail-content-wrapper mt-3">
                            <div className="main-info__title">
                              <h1 className="">
                                <span className="main-info__title-main">
                                  {viewProperty?.categoryId}
                                  <br />
                                </span>
                              </h1>
                              <small>{viewProperty?.description}</small>
                            </div>
                          </div>
                          <div
                            id="links"
                            className="links-detail-info mb-3 mt-3 detail-content-wrapper"
                          >
                            <Link
                              onClick={() => {
                                navigate(
                                  toastAlert("error", t("ADD_FAVOURITE"))
                                );
                              }}
                              className="favorite-btn  "
                              data-role="add"
                            >
                              <i className="icon-heart" role="img"></i>
                              <span>
                                {t("SAVE")}
                                <span className="hide-txt">
                                  {t("TO_FAVOURITE")}
                                </span>
                              </span>
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="detail-content-wrapper mt-3">
                            <div className="main-info__title">
                              <h1 className="">
                                <span className="main-info__title-main">
                                  {viewProperty?.type_of_real_estate}
                                </span>
                              </h1>
                              <span className="main-info__title-block">
                                <span className="main-info__title-minor">
                                  <b>{t("STREET")}:</b> {viewProperty?.street}
                                </span>
                                <button
                                  type="button"
                                  className="main-info__title-map"
                                ></button>
                              </span>
                            </div>
                            <div className="info-data mt-2 mb-2">
                              <span className="info-data-price">
                                <b>
                                  {constant.EURO}
                                  {Number(
                                    viewProperty?.price
                                  )?.toLocaleString()}
                                </b>
                              </span>
                            </div>
                            <div className="info-features mb-3 mt-2">
                              <span>
                                <b>{t("GROSS_AREA")} : &nbsp;</b>
                                {viewProperty?.gross_area + " " + "m2"}
                              </span>
                              <span>
                                <b>{t("NET_AREA")} :&nbsp;</b>
                                {viewProperty?.net_area + " " + "m2"}
                              </span>
                              <span>
                                <b>{t("FLOOR")} :&nbsp;</b>
                                {viewProperty?.floor}
                              </span>
                              <span>
                                <b>{t("ROOMS")} :&nbsp;</b>
                                {viewProperty?.rooms}
                              </span>

                              <span>
                                <b>{t("ELEVATOR")} :&nbsp;</b>
                                {viewProperty?.elevator === constant.LIFT_YES
                                  ? t("YES")
                                  : t("NO")}
                              </span>
                              <span>
                                <b className="text-dark">
                                  {t("RENTAL_YIELD")} :&nbsp;
                                </b>
                                {viewProperty?.expectedRentalYield || "N/A"}{" "}
                                {viewProperty?.expectedRentalYield && "%"}
                              </span>
                              &nbsp;&nbsp;&nbsp;
                              <span>
                              <b className="text-dark">
                                {t("DAYS_TO_SALE")} : &nbsp;
                              </b>
                              &nbsp;
                              {viewProperty?.daysToSale || "N/A"}
                              </span>
                              &nbsp; &nbsp;&nbsp;
                              <span>
                                <b className="text-dark">
                                  {t("PRICE_ESTIMATION")}:
                                </b>
                                &nbsp;
                                {viewProperty?.priceEstimation && constant.EURO} { viewProperty?.priceEstimation || "N/A"}
                              </span>
                              &nbsp;&nbsp;
                              <span>
                              <b className="text-dark">
                                {t("PRICE_DELTA")} : &nbsp;
                              </b>
                              {viewProperty?.priceDelta || "N/A"} { viewProperty?.priceDelta && "%"}
                              </span>
                              &nbsp;&nbsp;&nbsp;
                            </div>
                            <div
                              id="links"
                              className="links-detail-info mb-3 mt-3 detail-content-wrapper"
                            >
                              <Link
                                onClick={() => {
                                  navigate(
                                    toastAlert("error", t("ADD_FAVOURITE"))
                                  );
                                }}
                                className="favorite-btn  "
                                data-role="add"
                              >
                                <i className="icon-heart" role="img"></i>
                                <span>
                                  {t("SAVE")}&nbsp;
                                  <span className="hide-txt">
                                    {t("TO_FAVOURITE")}
                                  </span>
                                </span>
                              </Link>
                            </div>
                            <div
                              id="comment-wrapper"
                              className="comment-wrapper "
                            >
                              <div className="textarea-wrapper"></div>
                            </div>
                            <div className="commentsContainer">
                              <h2 className="comments-h2">
                                {t("PROPERTY_DESCRIPTION")}
                              </h2>
                              <div className="select-comment-lang">
                                {t("AVAILABLE_IN")}

                                <Link
                                  data-lang="pt"
                                  style={{ cursor: "alias" }}
                                >
                                  {viewProperty?.district}
                                </Link>
                              </div>
                            </div>
                            <AnimateHeight height={height}>
                              <div className="adCommentsLanguage">
                                <br />
                                <p>{viewProperty?.description}.</p>
                              </div>

                              <div id="details" className="details-box mt-4">
                                <div className="details-property d-flex">
                                  <div className="details-property-feature-one">
                                    <h2 className="details-property-h2">
                                      {t("BASIC_FAETURES")}
                                    </h2>
                                    <div className="details-property_features">
                                      <ul>
                                        {/* <li>
                                          <b>{t("PROPERTY_TYPE")}:&nbsp;</b>
                                          {viewProperty?.categoryId}
                                        </li> */}
                                        <li>
                                          <b>{t("TYPE_OF_FLAT")} :&nbsp;</b>
                                          {viewProperty?.type_of_real_estate}
                                        </li>
                                        <li>
                                          <b>{t("BATHROOMS")} :&nbsp;</b>
                                          {viewProperty?.baths}
                                        </li>
                                        <li>
                                          <b>{t("ORIENTATION")} :&nbsp;</b>
                                          {viewProperty?.position}
                                        </li>
                                        {viewProperty?.condition ? (
                                          <li>
                                            <b>{t("CONDITION")} :&nbsp;</b>
                                            {Array.isArray(
                                              viewProperty.condition
                                            )
                                              ? viewProperty.condition.join(
                                                  ", "
                                                )
                                              : viewProperty.condition ===
                                                  constant.PROPERTY_GOOD_CONDITION
                                                ? t("GOOD_CONDITION")
                                                : String(viewProperty.condition)}
                                          </li>
                                        ) : null}
                                        <li>
                                          <b>{t("LINK*")} :&nbsp;</b>
                                          {viewProperty?.link}
                                        </li>
                                        <li>
                                          <b>{t("REFERENCE*")} :&nbsp;</b>
                                          {viewProperty?.reference}
                                        </li>
                                      </ul>
                                    </div>

                                    <div className="details-property_features ">
                                      <ul>
                                        {viewProperty?.other_features_real_estate ==
                                        "" ? (
                                          ""
                                        ) : (
                                          <>
                                            <h2 className="details-property-h2 mt-4">
                                              {t("BUILDING_FEATURES")}
                                            </h2>
                                            {viewProperty?.other_features_real_estate?.map(
                                              (data) => {
                                                return (
                                                  <>
                                                    <li>{data}</li>
                                                  </>
                                                );
                                              }
                                            )}
                                          </>
                                        )}
                                        {viewProperty?.other_features_building ==
                                        "" ? (
                                          ""
                                        ) : (
                                          <>
                                            <h2 className="details-property-h2 mt-4">
                                              {t("OTHER_FEATURES")}
                                            </h2>

                                            {viewProperty?.other_features_building?.map(
                                              (data) => {
                                                return (
                                                  <>
                                                    <li>{data}</li>
                                                  </>
                                                );
                                              }
                                            )}
                                          </>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="details-property-feature-two">
                                    <h2 className="details-property-h2"></h2>
                                    <div className="details-property_features">
                                      {viewProperty?.energy_class && (
                                        <>
                                          <ul>
                                            <h2 className="details-property-h2">
                                              {t(
                                                "ENERGY_PERFORMANCE_CERTIFICATE"
                                              )}
                                            </h2>
                                            <div className="details-property_features">
                                              <ul>
                                                <li>
                                                  <span>
                                                    <b>
                                                      {t(
                                                        "ENERGY_EFFICIENCY_RATING"
                                                      )}
                                                      : &nbsp;
                                                    </b>
                                                  </span>
                                                  <span
                                                    title="a"
                                                    className="icon-energy-c-2"
                                                  >
                                                    {viewProperty?.energy_class}
                                                  </span>
                                                </li>
                                              </ul>
                                            </div>
                                          </ul>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AnimateHeight>

                            <div className="expanderParent">
                              <span
                                className="expander"
                                onClick={() =>
                                  setHeight(height === 0 ? "auto" : 0)
                                }
                              >
                                {t("SEE_COMPLETE_COMMENT")}&nbsp;&nbsp;
                                <FaAngleDown />
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {viewProperty?.categoryId == "Business" ? (
                      ""
                    ) : (
                      <>
                        <div className="sidebox">
                          <div id="mapWrapper">
                            <div
                              id="headerMap"
                              className="detail-content-wrapper mb-0"
                            >
                              <h2 className="details-property-h2">
                                {t("PRICE")}
                              </h2>
                              <ul>
                                <li className="header-map-list">
                                  <b>{t("PROPERTY_PRICE")} :</b> &nbsp;
                                  {constant.EURO}
                                  {Number(
                                    viewProperty?.price
                                  )?.toLocaleString()}
                                </li>
                                {viewProperty?.building_fee && (
                                  <li className="header-map-list">
                                    <b>{t("BUILDING_FEE")}: </b>&nbsp;
                                    {constant.EURO}
                                    {Number(
                                      viewProperty?.building_fee
                                    )?.toLocaleString()}
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="sidebox mt-4">
                          <div id="mapWrapper">
                            <div
                              id="headerMap"
                              className="detail-content-wrapper mb-0"
                            >
                              <h2 className="details-property-h2">
                                {t("LOCATION")}
                              </h2>
                              <ul>
                                <li className="header-map-list">
                                  <b>{t("STREET")} :</b> {viewProperty?.street}
                                </li>
                                {viewProperty?.building_no && (
                                  <>
                                    <li className="header-map-list">
                                      <b>{t("BUILDING_NUMBER")} : </b>
                                      {viewProperty?.building_no}
                                    </li>
                                  </>
                                )}
                                <li className="header-map-list">
                                  <b>{t("PLACE")} : </b>
                                  {viewProperty?.place}
                                </li>
                                {viewProperty?.municipality && (
                                  <>
                                    <li className="header-map-list">
                                      <b>{t("MUNICIPALITY")} : </b>
                                      {viewProperty?.municipality}
                                    </li>
                                  </>
                                )}
                                {viewProperty?.district && (
                                  <li className="header-map-list">
                                    <b>{t("DISTRICT")} : </b>
                                    {viewProperty?.district}
                                  </li>
                                )}

                                {viewProperty?.postalCode && (
                                  <li className="header-map-list">
                                    <b>{t("POSTALCODE")} : </b> &nbsp;
                                    {viewProperty?.postalCode}
                                  </li>
                                )}
                              </ul>
                            </div>

                            <div className="map-view">
                              <div style={{ height: "50vh", width: "100%" }}>
                                <PropertyMap
                                  lat={center?.lat}
                                  lng={center?.lng}
                                  height={400}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Col>
            <ContactUs />
          </Row>
        </Container>
      </section>
      <Footer />
      {isFetching && <Loader />}
    </>
  );
}

export default Searchdetail;
