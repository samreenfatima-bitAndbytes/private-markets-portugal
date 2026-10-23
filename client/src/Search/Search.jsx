/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
*/
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { React, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ReactPaginate from "react-paginate";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "swiper/swiper-bundle.css";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ListingFiltersBar from "../realstateagent/ListingFiltersBar";
import { getPropertySearch } from "../services/Services";
import { truncate } from "../utils/Functions";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import {
  PROPERTY_IMG_FALLBACK,
  propertyThumbUrl,
} from "../utils/propertyImages";
import "../realstateagent/allProperty.scss";
import "./search.scss";

function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreFilters, setMoreFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_THIRTY,
    sort: "",
    totalCount: 0,
  });

  const {
    handleChange,
    handleBlur,
    setFieldValue,
    values,
    resetForm,
  } = useFormik({
    initialValues: {
    search: location?.state?.name ?? "",
    propertyType: location?.state?.property_type ?? "",
    minPrice: "",
      maxPrice: "",
    minSize: "",
      maxSize: "",
    condition: "",
    other_features_real_estate: [],
    other_features_building: [],
    baths: "",
    rooms: "",
    floor: "",
    gross_area: "",
    date: "",
    sort: "",
    minNet: "",
    maxNet: "",
    minPriceEstimation: "",
    maxPriceEstimation: "",
    minExpectedRentalYield: "",
    maxExpectedRentalYield: "",
    minDaysToSale: "",
    maxDaysToSale: "",
    minPriceDelta: "",
    maxPriceDelta: "",
    },
    onSubmit: () => {},
  });

  const { data: propertyList, isFetching } = useQuery({
    queryKey: [
      "property-list-public",
      {
        parish: location?.state?.parish,
        municipality: location?.state?.municipality,
        district: location?.state?.district,
        search: location?.state?.name || values?.search || "",
        page: pagination.pageNo,
        limit: pagination.pageLimit,
        propertyType: values?.propertyType,
        minPrice: values?.minPrice,
        maxPrice: values?.maxPrice,
        minSize: values?.minSize,
        maxSize: values?.maxSize,
        rooms: values?.rooms,
        baths: values?.baths,
        condition: values?.condition,
        other_features_real_estate:
          values?.other_features_real_estate?.toString(),
        other_features_building: values?.other_features_building?.toString(),
        floor: values?.floor,
        date: values?.date,
        sort: pagination?.sort,
        minNet: values?.minNet,
        maxNet: values?.maxNet,
        lng: location?.state?.lat,
        lat: location?.state?.lng,
        minPriceEstimation: values?.minPriceEstimation,
        maxPriceEstimation: values?.maxPriceEstimation,
        minExpectedRentalYield: values?.minExpectedRentalYield,
        maxExpectedRentalYield: values?.maxExpectedRentalYield,
        minDaysToSale: values?.minDaysToSale,
        maxDaysToSale: values?.maxDaysToSale,
        minPriceDelta: values?.minPriceDelta,
        maxPriceDelta: values?.maxPriceDelta,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await getPropertySearch(query);
      const { _meta } = resp?.data ?? {};
      setPagination((prev) => ({
        ...prev,
        totalCount: _meta?.totalCount,
        pageNo: _meta?.currentPage ?? prev.pageNo,
        pageLimit: _meta?.perPage ?? prev.pageLimit,
      }));
      return resp?.data?.data ?? [];
    },
  });

  // New filters → always show first page of matches
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNo: 1 }));
  }, [
    values.propertyType,
    values.minPrice,
    values.maxPrice,
    values.minSize,
    values.maxSize,
    values.rooms,
    values.baths,
    values.condition,
    values.floor,
    values.date,
    values.minNet,
    values.maxNet,
    values.minPriceEstimation,
    values.maxPriceEstimation,
    values.minExpectedRentalYield,
    values.maxExpectedRentalYield,
    values.minDaysToSale,
    values.maxDaysToSale,
    values.minPriceDelta,
    values.maxPriceDelta,
    values.other_features_real_estate,
    values.other_features_building,
  ]);

  const handleStateFilterChange = (e) => {
    setPagination((prev) => ({
      ...prev,
      sort: e.target.value,
      pageNo: 1,
    }));
  };

  const handleOtherFeatures = (e) => {
    if (values?.other_features_building?.includes(e.target.value)) {
      setFieldValue(
        "other_features_building",
        values.other_features_building.filter((i) => i !== e.target.value)
      );
    } else {
      setFieldValue("other_features_building", [
        ...values.other_features_building,
          e.target.value,
      ]);
    }
  };

  const handleFeatures = (e) => {
    if (values?.other_features_real_estate?.includes(e.target.value)) {
      setFieldValue(
        "other_features_real_estate",
        values.other_features_real_estate.filter((i) => i !== e.target.value)
      );
    } else {
      setFieldValue("other_features_real_estate", [
        ...values.other_features_real_estate,
          e.target.value,
      ]);
    }
  };

  const placeLabel = (location?.state?.name || "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== "undefined")
    .join(", ");

  return (
    <>
      <Header />
      <section className="searchsection listing-page">
        <Container>
          <div className="listing-page__head">
            <div>
              <h2 className="mainheading mb-1">
                {t("PROPERTY_FOR_SALE")}
                {placeLabel ? ` in ${placeLabel}` : ""}
          </h2>
              <p className="listing-page__sub mb-0">
                {t("SHOWING")} {pagination?.totalCount ?? 0} {t("RESULT")}
                {values?.propertyType ? ` · ${values.propertyType}` : ""}
              </p>
              </div>
                </div>

          <ListingFiltersBar
            values={values}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={setFieldValue}
            resetForm={resetForm}
            pagination={pagination}
            onSortChange={handleStateFilterChange}
            propertyCount={propertyList?.length || 0}
            moreOpen={moreFilters}
            setMoreOpen={setMoreFilters}
            handleFeatures={handleFeatures}
            handleOtherFeatures={handleOtherFeatures}
            onSaveSearch={() => toastAlert("error", t("ADD_SAVE_SEARCH"))}
            onDownload={() => navigate("/product-list")}
          />

          <div className="listing-page__results">
              <div className="property-list">
                {propertyList?.length > 0 ? (
                propertyList.map((data, index) => {
                    const imageUrl = propertyThumbUrl(data);
                    return (
                    <div
                      className="property_list_item"
                      key={data?._id || index}
                    >
                          <Row className="m-0">
                                <Col lg={3} md={5} className="pe-0 ps-0">
                                  <div className="single_property_img">
                                    <img
                              src={
                                data?.categoryId === "Business"
                                  ? "/business.jpg"
                                  : imageUrl
                              }
                                      width="50px"
                                      height="50px"
                                      alt={data?.name || `Property ${index + 1}`}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = PROPERTY_IMG_FALLBACK;
                                      }}
                                    />
                                  </div>
                                </Col>
                            <Col lg={9} md={7} className="ps-0 pe-0">
                                  <div className="single_property_text">
                                    <div className="single_property_top px-4">
                                      <div className="d-flex justify-content-between">
                                        <div>
                                          <h4>
                                            <Link
                                              className="item_title"
                                              to={`/search-detail/${data?._id}`}
                                            >
                                      {data?.categoryId === "Business"
                                        ? data?.categoryId
                                        : `${data?.type_of_real_estate} in ${data?.street}`}
                                            </Link>
                                          </h4>
                                  {data?.categoryId !== "Business" && (
                                          <span className="price">
                                            <b>
                                              {constant.EURO}
                                        {Number(data?.price)?.toLocaleString()}
                                            </b>
                                          </span>
                                  )}
                                        </div>
                                        <div className="d-flex">
                                          <span>
                                            <Link
                                      onClick={() =>
                                        toastAlert("error", t("ADD_FAVOURITE"))
                                      }
                                            >
                                              <svg
                                                width="20"
                                                height="20"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 512 512"
                                              >
                                                <path
                                                  fill="#004aad"
                                                  d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"
                                                />
                                              </svg>
                                            </Link>
                                          </span>
                                        </div>
                                      </div>

                              {data?.categoryId === "Business" ? (
                                <p className="mt-2">
                                  {truncate(data?.description, 100)}
                                </p>
                              ) : (
                                <>
                                      <p className="mt-2">
                                        <span>
                                          <b className="text-dark">
                                            {t("ROOMS")} :&nbsp;
                                          </b>
                                          {data?.rooms}
                                        </span>
                                    &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                        {t("GROSS_AREA")} :&nbsp;
                                          </b>
                                      {data?.gross_area} m2
                                        </span>
                                        &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                            {t("NET_AREA")}:
                                          </b>
                                      {data?.net_area} m2
                                        </span>
                                        &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                        {t("FLOOR")} :&nbsp;
                                          </b>
                                          {data?.floor}
                                        </span>
                                        &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                        {t("ELEVATOR")} :&nbsp;
                                          </b>
                                          {data?.elevator === constant.LIFT_YES
                                            ? t("YES")
                                            : t("NO")}
                                        </span>
                                        &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                            {t("RENTAL_YIELD")} :&nbsp;
                                          </b>
                                      {data.expectedRentalYield || "N/A"}
                                      {data.expectedRentalYield && "%"}
                                        </span>
                                        &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                        {t("DAYS_TO_SALE")} :&nbsp;
                                          </b>
                                          {data?.daysToSale || "N/A"}
                                        </span>
                                    &nbsp;&nbsp;&nbsp;
                                        <span>
                                          <b className="text-dark">
                                            {t("PRICE_ESTIMATION")}:
                                          </b>
                                          &nbsp;
                                      {data?.priceEstimation && constant.EURO}{" "}
                                      {data?.priceEstimation || "N/A"}
                                        </span>
                                    &nbsp;&nbsp;&nbsp;
                                        <span>
                                        <b className="text-dark">
                                        {t("PRICE_DELTA")} :&nbsp;
                                        </b>
                                      {data?.priceDelta || "N/A"}
                                      {data?.priceDelta && "%"}
                                        </span>
                                      </p>
                                      <p>{truncate(data?.description, 250)}</p>
                                </>
                              )}

                                      <div className="mb-3">
                                        <span
                                          style={{ cursor: "pointer" }}
                                          className="badge bg-success"
                                          onClick={() =>
                                    navigate(`/search-detail/${data?._id}`)
                                          }
                                        >
                                          {t("SEE_VIEW")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                            </Col>
                          </Row>
                        </div>
                    );
                  })
                ) : (
                    <DataNotFound />
                )}
              </div>

              {Math.ceil(pagination.totalCount / constant.PER_PAGE_THIRTY) >
                1 && (
                    <ReactPaginate
                containerClassName={"pagination position-relative mt-2 pt-3"}
                      previousLinkClassName={"pagination__link"}
                      nextLinkClassName={"pagination__link"}
                      disabledClassName={"pagination__link--disabled"}
                      activeClassName={"pagination__link--active"}
                      previousLabel={"Prev"}
                      nextLabel={"Next"}
                      onPageChange={(props) => {
                  setPagination((prev) => ({
                    ...prev,
                          pageNo: props.selected + 1,
                  }));
                      }}
                      pageCount={Math.ceil(
                        pagination.totalCount / constant.PER_PAGE_THIRTY
                      )}
                    />
                )}
          </div>
        </Container>
      </section>
      <Footer />
      {isFetching && <Loader />}
    </>
  );
}

export default Search;
