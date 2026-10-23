/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import React, { useState } from "react";
import { productListWithoutAuth } from "../services/Services";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { constant } from "../utils/constant";
import Header from "../components/Header";
import { Col, Container, Row } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import DataNotFound from "../components/DataNotFound";
import CommonFooter from "../components/CommonFooter";
import Loader from "../Loader/Loader";
import Footer from "../components/Footer";
import { toastAlert } from "../utils/SweetAlert";
import { mediaUrl } from "../utils/mediaUrl";

const ProductListWithoutAuth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_EIGHT,
  });

  const { data: productList, isFetching } = useQuery({
    queryKey: [
      "productList",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await productListWithoutAuth(query);
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
  return (
    <>
      <Header />
      <section className="searchsection">
        <Container>
          <Row>
            <Col md={12}>
              <Row>
                {productList?.length > 0 ? (
                  productList?.map((data, index) => {
                    return (
                      <>
                        <Col lg={3} key={index}>
                          <div className="sidebox overflow-hidden bg-white py-4 p-3 mt-4">
                            <div className="d-flex align-items-center mt-4 justify-content-center gap-3">
                              {data?.productImg.length > 0 ? (
                                <>
                                  <img
                                    className="w-100"
                                    src={
                                      data?.productImg?.[0]
                                        ? mediaUrl(data?.productImg?.[0])
                                        : "/static_image.jpg"
                                    }
                                    width="200px"
                                    height="150px"
                                  />
                                </>
                              ) : (
                                <img src="/static_image.jpg" />
                              )}
                            </div>

                            <h5 className="text-center my-3">
                              {data?.productName}
                            </h5>
                            <p className="text-center my-3">
                              {constant.EURO}
                              {Number(data?.price)?.toLocaleString()}
                            </p>
                            <button
                              className="btn btn-theme2 px-5 w-100"
                              onClick={() => {
                                toastAlert("error", t("FIRSTLY_LOGIN"));
                              }}
                            >
                              {t("ADD_TO_CART")}
                            </button>
                          </div>
                        </Col>
                      </>
                    );
                  })
                ) : (
                  <div>
                    <DataNotFound />
                  </div>
                )}

                {Math.ceil(pagination.totalCount / constant.PER_PAGE_EIGHT) >
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
                        pagination.totalCount / constant.PER_PAGE_EIGHT
                      )}
                    />
                  </div>
                )}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
      {/* {isFetching || addCartMutation?.isPending ? <Loader /> : ""} */}
    </>
  );
};

export default ProductListWithoutAuth;
