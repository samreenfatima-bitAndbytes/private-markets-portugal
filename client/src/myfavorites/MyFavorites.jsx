/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { React, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaHeart } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link, useNavigate } from "react-router-dom";
import "swiper/swiper-bundle.css";
import Loader from "../Loader/Loader";
import "../Search/search.scss";
import CustomSelect from "../components/CustomSelect";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import {
  customerAddFavourite,
  customerFavouriteList,
} from "../services/Services";
import { truncate } from "../utils/Functions";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import {
  PROPERTY_IMG_FALLBACK,
  propertyThumbUrl,
} from "../utils/propertyImages";
import "./myfav.scss";

function MyFavorites() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_THREE,
    sort: "",
  });
  const { data: favouriteList, isFetching } = useQuery({
    queryKey: [
      "favourite-list",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
        sort: pagination.sort,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await customerFavouriteList(query);
      const { _meta } = resp?.data ?? {};
      setPagination((prevPagination) => ({
        ...prevPagination,
        totalCount: _meta?.totalCount,
        pageNo: _meta?.currentPage ?? prevPagination.pageNo,
        pageLimit: _meta?.perPage ?? prevPagination.pageLimit,
      }));
      return resp?.data?.data;
    },
  });

  const addAndRemoveFavouritesMutation = useMutation({
    mutationFn: (body) => customerAddFavourite(body),
    onSuccess: () => {
      toastAlert("success", t("FAVOURITE_REMOVE_FILTER"));
      queryClient.invalidateQueries({ queryKey: ["favourite-list"] });
    },
  });

  const handleStateFilterChange = (e) => {
    setPagination({
      ...pagination,
      sort: e.target.value,
      pageNo: 1, // Reset page number to 1 when state filter changes
    });
  };

  return (
    <>
      <Header />

      <section className="employee-dashbord searchsection my-fav">
        <Container>
          <Row>
            <Col lg={3}>
              <UserSidebar />
            </Col>
            <Col lg={9} className="min-w-0">
                <h1 className="mainheading">{t("MY_FAVOURITES")}</h1>
                <div
                  className="order-by d-flex align-items-center justify-content-end"
                  data-param="ordem"
                >
                  <span className="order-by-label">{t("SORT_BY")}:</span>

                  <CustomSelect
                    className="gross-drop"
                    disabled={favouriteList?.length <= 0}
                    value={pagination.sort ?? ""}
                    onChange={(val) =>
                      handleStateFilterChange({ target: { value: val } })
                    }
                    placeholder={t("MORE")}
                    aria-label={t("SORT_BY")}
                    options={[
                      { value: "", label: t("MORE") },
                      {
                        value: constant.PROPERTY_RECENT,
                        label: t("MOST_RECENT"),
                      },
                      {
                        value: constant.PROPERTY_LEAST,
                        label: t("LEAST_RECENT"),
                      },
                      {
                        value: constant.PROPERTY_HIGHEST_PRICE,
                        label: t("HIGHEST_PRICE"),
                      },
                      {
                        value: constant.PROPERTY_LOWEST_PRICE,
                        label: t("LOWEST_PRICE"),
                      },
                      {
                        value: constant.PROPERTY_HIGHEST_FLOOR,
                        label: t("HIGHEST_FLOOR"),
                      },
                      {
                        value: constant.PROPERTY_LOWEST_FLOOR,
                        label: t("LOWEST_FLOOR"),
                      },
                      {
                        value: constant.PROPERTY_HIGHEST_ESTIMATED_PRICE,
                        label: t("HIGHEST_ESTIMATED_PRICE"),
                      },
                      {
                        value: constant.PROPERTY_LOWEST_ESTIMATED_PRICE,
                        label: t("LOWEST_ESTIMATED_PRICE"),
                      },
                      {
                        value: constant.PROPERTY_HIGHEST_RENTAL_YIELD,
                        label: t("HIGHEST_RENTAL_YIELD"),
                      },
                      {
                        value: constant.PROPERTY_LOWEST_RENTAL_YIELD,
                        label: t("LOWEST_RENTAL_YIELD"),
                      },
                      {
                        value: constant.PROPERTY_MAXIMUM_DAYS_TO_SALE,
                        label: t("MAXIMUM_DAYS_TO_SALE"),
                      },
                      {
                        value: constant.PROPERTY_MINIMUM_DAYS_TO_SALE,
                        label: t("MINIMUM_DAYS_TO_SALE"),
                      },
                      {
                        value: constant.PROPERTY_HIGHEST_PRICE_DELTA,
                        label: t("HIGHEST_PRICE_DELTA"),
                      },
                      {
                        value: constant.PROPERTY_LOWEST_PRICE_DELTA,
                        label: t("LOWEST_PRICE_DELTA"),
                      },
                    ]}
                  />
                </div>

            <div className="property-list">
              {favouriteList?.length > 0 ? (
                favouriteList?.map((data, index) => {
                  const imageUrl = propertyThumbUrl(data?.propertyDetails);
                  return (
                    <>
                      <div className="property_list_item" key={data?._id || index}>
                        <Row className="m-0">
                          {data?.propertyDetails?.categoryId == "Business" ? (
                            <>
                              <Col lg={3} md={5} className="pe-0 ps-0">
                                <div className="single_property_img">
                                  <img
                                    src="/business.jpg"
                                    width="50px"
                                    height="50px"
                                    alt="Default Image"
                                  />
                                </div>
                              </Col>
                            </>
                          ) : (
                            <>
                              <Col lg={3} md={5} className="pe-0 ps-0">
                                <div className="single_property_img">
                                  <img
                                    src={imageUrl}
                                    width="50px"
                                    height="50px"
                                    alt={
                                      data?.propertyDetails?.name ||
                                      `Favourite ${index + 1}`
                                    }
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = PROPERTY_IMG_FALLBACK;
                                    }}
                                  />
                                </div>
                              </Col>
                            </>
                          )}

                          <Col lg={8} md={7} className="ps-0 pe-0">
                            {data?.propertyDetails?.categoryId == "Business" ? (
                              <>
                                <div className="single_property_text">
                                  <div className="single_property_top px-4">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h4>
                                          <Link
                                            className="item_title"
                                            to={`/customer/property-detail/${data?.propertyDetails?._id}`}
                                          >
                                            {truncate(
                                              data?.propertyDetails?.categoryId,
                                              40
                                            )}{" "}
                                            <br />{" "}
                                            {truncate(
                                              data?.propertyDetails
                                                ?.description,
                                              100
                                            )}
                                          </Link>
                                        </h4>
                                      </div>
                                      <div className="d-flex gap-4 align-items-center">
                                        <span>
                                          <Link>
                                            {data?.isFavourite && (
                                              <>
                                                <FaHeart
                                                  style={{
                                                    color: "#D62F2F",
                                                    width: "20",
                                                    height: "20",
                                                  }}
                                                  onClick={() => {
                                                    let body = {
                                                      propertyId:
                                                        data?.propertyId,
                                                      isFavourite: 2,
                                                    };
                                                    addAndRemoveFavouritesMutation.mutate(
                                                      body
                                                    );
                                                  }}
                                                />
                                              </>
                                            )}
                                          </Link>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mb-3">
                                      <span
                                        style={{ cursor: "pointer" }}
                                        className="badge bg-success"
                                        onClick={() =>
                                          navigate(
                                            `/customer/property-detail/${data?.propertyId}`
                                          )
                                        }
                                      >
                                        {t("SEE_VIEW")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="single_property_text">
                                  <div className="single_property_top px-4">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h4>
                                          <Link
                                            className="item_title"
                                            to={`/customer/property-detail/${data?.propertyDetails?._id}`}
                                          >
                                            {data?.propertyDetails
                                              ?.categoryId == "Business"
                                              ? data?.propertyDetails
                                                  ?.description
                                              : data?.propertyDetails
                                                  ?.type_of_real_estate +
                                                " in " +
                                                data?.propertyDetails?.street}
                                          </Link>
                                        </h4>
                                        <span className="price">
                                          <b>
                                            {constant.EURO}
                                            {Number(
                                              data?.propertyDetails?.price
                                            )?.toLocaleString()}
                                          </b>
                                        </span>
                                      </div>
                                      <div className="d-flex gap-4 align-items-center">
                                        <span>
                                          <Link>
                                            {data?.isFavourite && (
                                              <>
                                                <FaHeart
                                                  style={{
                                                    color: "#D62F2F",
                                                    width: "20",
                                                    height: "20",
                                                  }}
                                                  onClick={() => {
                                                    let body = {
                                                      propertyId:
                                                        data?.propertyId,
                                                      isFavourite: 2,
                                                    };
                                                    addAndRemoveFavouritesMutation.mutate(
                                                      body
                                                    );
                                                  }}
                                                />
                                              </>
                                            )}
                                          </Link>
                                        </span>
                                      </div>
                                    </div>
                                    <p className="mt-2">
                                      <span>
                                        <b className="text-dark">
                                          {t("ROOMS")} :&nbsp;
                                        </b>
                                        {data?.propertyDetails?.rooms}
                                      </span>
                                      &nbsp; &nbsp;&nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("GROSS_AREA")} :&nbsp;
                                        </b>
                                        &nbsp;
                                        {data?.propertyDetails?.gross_area +
                                          " " +
                                          "m2"}
                                      </span>
                                      &nbsp; &nbsp;&nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("NET_AREA")}:&nbsp;
                                        </b>
                                        &nbsp;
                                        {data?.propertyDetails?.net_area +
                                          " " +
                                          "m2"}
                                      </span>
                                      &nbsp;&nbsp; &nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("FLOOR")} :&nbsp;
                                        </b>
                                        {data?.propertyDetails?.floor}
                                      </span>
                                      &nbsp;&nbsp; &nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("ELEVATOR")} :&nbsp;
                                        </b>
                                        &nbsp;
                                        {data?.propertyDetails?.elevator ===
                                        constant.LIFT_YES
                                          ? t("YES")
                                          : t("NO")}
                                      </span>
                                      &nbsp;&nbsp;&nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("RENTAL_YIELD")} :&nbsp;
                                        </b>
                                        {data.propertyDetails?.expectedRentalYield || "N/A"} {data.propertyDetails?.expectedRentalYield && "%"}
                                      </span>
                                      &nbsp;&nbsp;&nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("DAYS_TO_SALE")} : &nbsp;
                                        </b>
                                        &nbsp;
                                        {data?.propertyDetails?.daysToSale || "N/A"}
                                      </span>
                                      &nbsp; &nbsp;&nbsp;
                                      <span>
                                        <b className="text-dark">
                                          {t("PRICE_ESTIMATION")}:
                                        </b>
                                        &nbsp;
                                        {data?.propertyDetails?.priceEstimation && constant.EURO}{data?.propertyDetails?.priceEstimation || "N/A"}
                                      </span>
                                      &nbsp;&nbsp; &nbsp;
                                        <span>
                                        <b className="text-dark">
                                          {t("PRICE_DELTA")} : &nbsp;
                                        </b>
                                        {data?.propertyDetails?.priceDelta || "N/A"}{data?.propertyDetails?.priceDelta && "%"}
                                        </span>
                                        &nbsp;&nbsp; &nbsp;
                                    </p>
                                    <p>
                                      {truncate(
                                        data?.propertyDetails?.description,
                                        250
                                      )}
                                    </p>
                                    {/* <p>
                                      <span>
                                        <b>{t("PROPERTY_TYPE")} :&nbsp;</b>
                                        <b>
                                          {data?.propertyDetails?.categoryId}
                                        </b>
                                      </span>
                                    </p> */}

                                    <div className="mb-3">
                                      <span
                                        style={{ cursor: "pointer" }}
                                        className="badge bg-success"
                                        onClick={() =>
                                          navigate(
                                            `/customer/property-detail/${data?.propertyId}`
                                          )
                                        }
                                      >
                                        {t("SEE_VIEW")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </>
                  );
                })
              ) : (
                <div>
                  <DataNotFound />
                </div>
              )}
              {Math.ceil(pagination.totalCount / constant.PER_PAGE_THREE) >
                1 && (
                <div>
                  <ReactPaginate
                    containerClassName={
                      "pagination position-relative mt-2 pt-3"
                    }
                    previousLinkClassName={"pagination__link"}
                    nextLinkClassName={"pagination__link"}
                    disabledClassName={"pagination__link--disabled"}
                    activeClassName={"pagination__link--active"}
                    previousLabel={"Prev"}
                    nextLabel={"Next"}
                    onPageChange={(props) => {
                      setPagination({
                        ...pagination,
                        pageNo: props.selected + 1,
                      });
                    }}
                    pageCount={Math.ceil(
                      pagination.totalCount / constant.PER_PAGE_THREE
                    )}
                  />
                </div>
              )}
            </div>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
      {isFetching || addAndRemoveFavouritesMutation?.isPending ? (
        <Loader />
      ) : (
        ""
      )}
    </>
  );
}

export default MyFavorites;
