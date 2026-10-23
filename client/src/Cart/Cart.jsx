/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { React, useEffect } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { cart } from "../redux/features/cartSlice";
import { customerCartList, customerRemoveCart } from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import { mediaUrl } from "../utils/mediaUrl";
import "./cart.scss";

const CART_TYPE_PRODUCT = 2;
const CSV_FALLBACK = "/csv.png";

function cartItemView(item) {
  const product = item?.productDetails;
  const property = item?.propertyDetails;
  const isProduct =
    Number(item?.typeId) === CART_TYPE_PRODUCT ||
    (product && typeof product === "object" && product.productName);

  if (isProduct && product) {
    const raw = Array.isArray(product.productImg) ? product.productImg[0] : null;
    return {
      title: product.productName || "Data pack",
      subtitle: product.description ? String(product.description).slice(0, 72) : null,
      price: Number(product.price ?? item.price ?? 0) || 0,
      image: raw ? mediaUrl(raw, CSV_FALLBACK) : CSV_FALLBACK,
      badge: "Data pack",
    };
  }

  // Property listing CSV export (€15 seed item, etc.)
  const title =
    property?.name ||
    (property?.type_of_real_estate && property?.street
      ? `${property.type_of_real_estate} — ${property.street}`
      : null) ||
    item?.link ||
    "Property data CSV";
  return {
    title,
    subtitle: property?.reference || property?.place || null,
    price: Number(item?.price ?? item?.productPrice ?? 0) || 0,
    image: CSV_FALLBACK,
    badge: "Listing CSV",
  };
}

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data: cartList, isFetching } = useQuery({
    queryKey: ["cart-list"],
    queryFn: async () => {
      const resp = await customerCartList();
      return resp?.data?.data?.list ?? [];
    },
  });

  // Keep header badge in sync with live cart (fixes stale persisted count)
  useEffect(() => {
    if (cartList === undefined) return;
    dispatch(cart(cartList.length));
  }, [cartList, dispatch]);

  const totalPrice = (cartList || []).reduce(
    (sum, row) => sum + Number(cartItemView(row).price || 0),
    0
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => customerRemoveCart(payload),
    onSuccess: async () => {
      toastAlert("success", t("PRODUCT_REMOVED_SUCCESSFULLY"));
      queryClient.invalidateQueries({ queryKey: ["cart-list"] });
      try {
        const resp = await customerCartList();
        dispatch(cart(resp?.data?.data?.list?.length ?? 0));
      } catch {
        dispatch(cart(0));
      }
    },
  });

  return (
    <>
      <Header />
      <section className="searchsection cart-page">
        <Container>
          <div className="cart-page__head mb-3">
            <h2 className="mainheading mb-1">{t("CART") || "Cart"}</h2>
            <p className="cart-page__sub mb-0">
              {cartList?.length
                ? `${cartList.length} item${cartList.length === 1 ? "" : "s"} in your cart`
                : "Your cart is empty"}
            </p>
          </div>

          <Row className="g-4">
            <Col lg={8}>
              <Row className="g-3">
                {cartList?.length > 0 ? (
                  cartList.map((data) => {
                    const view = cartItemView(data);
                    return (
                      <Col xs={12} sm={6} xl={4} key={data?._id || view.title}>
                        <article className="cart-card">
                          <div className="cart-card__media">
                            <span className="cart-card__badge">
                              {view.badge}
                            </span>
                            <img
                              src={view.image || CSV_FALLBACK}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = CSV_FALLBACK;
                              }}
                            />
                          </div>
                          <div className="cart-card__body">
                            <h5 className="cart-card__title">{view.title}</h5>
                            {view.subtitle ? (
                              <p className="cart-card__subtitle">{view.subtitle}</p>
                            ) : null}
                            <p className="cart-card__price">
                              {constant.EURO}
                              {Number(view.price || 0).toLocaleString()}
                            </p>
                            <button
                              type="button"
                              className="btn btn-theme2 w-100 mt-auto"
                              onClick={() => mutate(data?._id)}
                              disabled={isPending}
                            >
                              {t("REMOVE")}
                            </button>
                          </div>
                        </article>
                      </Col>
                    );
                  })
                ) : (
                  <Col xs={12}>
                    <DataNotFound />
                  </Col>
                )}
              </Row>
            </Col>

            <Col lg={4}>
              <div className="sidebox buybox overflow-hidden bg-white cart-summary">
                <h6 className="px-lg-4 px-3 my-4 text-uppercase">
                  {t("CART_TOTAL")}
                </h6>
                <div className="table-responsive">
                  <Table className="mb-0">
                    <tbody>
                      <tr>
                        <td className="width30">SUBTOTAL</td>
                        <td>
                          {constant.EURO}
                          {Number(totalPrice ?? 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="width30 fw-bold border-0 pb-0">TOTAL</td>
                        <td className="fw-bold border-0 pb-0">
                          {constant.EURO}
                          {Number(totalPrice ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                <Row className="mt-3 px-lg-4 px-3">
                  <Col md={12}>
                    <button
                      className="btn btn-theme2 mb-3 w-100"
                      onClick={() => {
                        const productIds = (cartList || [])
                          .map(
                            (row) =>
                              row?.productId ||
                              row?.productDetails?._id ||
                              row?.propertyId
                          )
                          .filter(Boolean);
                        navigate("/customer/payment", {
                          state: { totalPrice, productIds },
                        });
                      }}
                      disabled={!cartList?.length}
                    >
                      {t("BUY")}
                    </button>
                  </Col>
                  <p className="fw-normal">{t("CART_CONTENT")}</p>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
      {isFetching || isPending ? <Loader /> : null}
    </>
  );
}

export default Cart;
