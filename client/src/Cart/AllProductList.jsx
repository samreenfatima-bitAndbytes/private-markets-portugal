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
import ReactPaginate from "react-paginate";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useDebounceEffect } from "../hooks/UseDebounceEffect";
import { cart } from "../redux/features/cartSlice";
import { store } from "../redux/store";
import { mediaUrl } from "../utils/mediaUrl";
import {
  customerAddCart,
  customerAllProperty,
  customerCartList,
} from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import "./cart.scss";

const PRODUCT_IMG_FALLBACK = "/csv.png";

function productCoverUrl(product) {
  const id = product?.productImg?.[0];
  if (!id) return PRODUCT_IMG_FALLBACK;
  return mediaUrl(id);
}

function AllProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    search: "",
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_EIGHT,
  });
  const debouncedSearch = useDebounceEffect(pagination?.search.trim(), 1000);

  const { data: productList, isFetching } = useQuery({
    queryKey: [
      "productList",
      {
        search: debouncedSearch,
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await customerAllProperty(query);
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

  const addCartMutation = useMutation({
    mutationFn: (body) => customerAddCart(body),
    onSuccess: async () => {
      toastAlert("success", t("PRODUCT_ADDED_SUCCESSFULLY"));
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      const resp = await customerCartList();
      store.dispatch(cart(resp?.data?.data?.list?.length ?? 0));
    },
  });

  return (
    <>
      <Header />
      <section className="searchsection product-shop">
        <Container>
          <div className="product-shop-head mb-4">
            <div>
              <h2 className="mainheading mb-2">{t("DOWNLOAD_FULL_LIST")}</h2>
              <p className="product-shop-lead mb-0">
                Buy a data pack to download full listing exports (CSV). Add a
                pack to your cart, then checkout to get the file.
              </p>
            </div>
            <div className="product-shop-actions">
              <Link
                className="btn btn-outline-primary"
                to="/customer/property-listing"
              >
                Back to listings
              </Link>
              <button
                type="button"
                className="btn btn-theme2"
                onClick={() => navigate("/customer/cart")}
              >
                {t("GO_TO_CART")}
              </button>
            </div>
          </div>

          <Row>
            {productList?.length > 0 ? (
              productList.map((data) => (
                <Col lg={3} md={6} key={data?._id}>
                  <div className="product-card sidebox overflow-hidden bg-white p-3 mt-3">
                    <div className="product-card__media">
                      <img
                        src={productCoverUrl(data)}
                        alt={data?.productName || "Data pack"}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PRODUCT_IMG_FALLBACK;
                        }}
                      />
                    </div>
                    <h5 className="text-center my-3">{data?.productName}</h5>
                    <p className="text-center product-card__price my-2">
                      {constant.EURO}
                      {Number(data?.price)?.toLocaleString()}
                    </p>
                    <button
                      className="btn btn-theme2 px-5 w-100"
                      type="button"
                      disabled={addCartMutation.isPending}
                      onClick={() => {
                        addCartMutation.mutate({ productId: data?._id });
                      }}
                    >
                      {t("ADD_TO_CART")}
                    </button>
                  </div>
                </Col>
              ))
            ) : (
              <div>
                <DataNotFound />
              </div>
            )}

            {Math.ceil(pagination.totalCount / constant.PER_PAGE_EIGHT) > 1 && (
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
                  pageCount={Math.ceil(
                    pagination.totalCount / constant.PER_PAGE_EIGHT
                  )}
                  onPageChange={(page) => {
                    setPagination({
                      ...pagination,
                      pageNo: page.selected + 1,
                    });
                  }}
                  forcePage={pagination.pageNo - 1}
                />
              </div>
            )}
          </Row>
        </Container>
      </section>
      <Footer />
      {isFetching && <Loader />}
    </>
  );
}

export default AllProductList;
