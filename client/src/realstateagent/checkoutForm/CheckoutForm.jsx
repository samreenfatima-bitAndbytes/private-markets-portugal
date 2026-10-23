/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Modal, Row } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../Loader/Loader";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useDispatch } from "react-redux";
import { cart as setCartCount } from "../../redux/features/cartSlice";
import {
  contactCsvDownload,
  customerCardDelete,
  customerCardList,
  customerCartList,
  customerOrderCreate,
  customerOrderDownload,
} from "../../services/Services";
import { toastAlert } from "../../utils/SweetAlert";
import StripeCard from "./StripeCard";

function cardId(card) {
  return String(card?.id || card?._id || "");
}

function formatExpiry(card) {
  const month = Number(card?.exp_month ?? card?.expMonth) || 0;
  const year = Number(card?.exp_year ?? card?.expYear) || 0;
  if (!month || !year) return "";
  const yy = String(year).slice(-2).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${mm}/${yy}`;
}

const CheckoutForm = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [propertyId, setPropertyId] = useState([]);
  const [paidOrderId, setPaidOrderId] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState("");

  const { data: cardList, isFetching } = useQuery({
    queryKey: ["cardList"],
    queryFn: async () => {
      const resp = await customerCardList();
      return resp.data?.data ?? [];
    },
  });

  const { data: cartSnapshot } = useQuery({
    queryKey: ["cart-list", "payment-total"],
    queryFn: async () => {
      const resp = await customerCartList();
      return {
        total: Number(resp?.data?.data?.total ?? 0),
        productIds: (resp?.data?.data?.list || [])
          .map(
            (row) =>
              row?.productId ||
              row?.productDetails?._id ||
              row?.propertyId
          )
          .filter(Boolean),
      };
    },
  });

  const totalPrice = useMemo(() => {
    const fromNav = Number(location?.state?.totalPrice);
    if (fromNav > 0) return fromNav;
    return Number(cartSnapshot?.total ?? 0);
  }, [location?.state?.totalPrice, cartSnapshot?.total]);

  const productIds = useMemo(() => {
    const fromNav = location?.state?.productIds;
    if (Array.isArray(fromNav) && fromNav.length) return fromNav;
    return cartSnapshot?.productIds || [];
  }, [location?.state?.productIds, cartSnapshot?.productIds]);

  const handleDelete = (id) => {
    Swal.fire({
      title: t("ARE_YOU_SURE"),
      text: t("YOU_WANT_TO_DELETE_CARD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#004aad",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YOU_DELETE_IT"),
      cancelButtonText: t("CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        deleteSchedularList.mutate(id);
      }
    });
  };

  const deleteSchedularList = useMutation({
    mutationFn: (id) => customerCardDelete(id),
    onSuccess: () => {
      toastAlert("success", t("CARD_DELETE_TOAST"));
      queryClient.invalidateQueries({ queryKey: ["cardList"] });
    },
  });

  // Auto-select newly added / only remaining card
  useEffect(() => {
    if (!cardList?.length) {
      setSelectedCard("");
      return;
    }
    const stillSelected = cardList.some(
      (c) => cardId(c) === String(selectedCard)
    );
    if (stillSelected) return;
    const newest = [...cardList].sort(
      (a, b) => Number(b.created || 0) - Number(a.created || 0)
    )[0];
    const next = cardId(newest);
    if (next) setSelectedCard(next);
  }, [cardList, selectedCard]);

  const handlePayAmount = () => {
    if (!selectedCard) {
      toastAlert("error", t("SELECT_CARD_TOAST"));
      return;
    }
    if (!(totalPrice > 0) && !productIds.length) {
      toastAlert("error", "Your cart is empty");
      return;
    }
    payMutation.mutate({
      paymentMethodId: selectedCard,
      orderTotal: totalPrice,
      total: totalPrice,
      productIds,
    });
  };

  const payMutation = useMutation({
    mutationFn: (body) => customerOrderCreate(body),
    onSuccess: (resp) => {
      if (resp?.data?.success === false) {
        toastAlert("error", resp?.data?.message || "Payment failed");
        return;
      }
      setPropertyId(resp?.data?.data?.productId || []);
      setPaidOrderId(resp?.data?.data?._id || "");
      toastAlert("success", t("ORDER_ADD_TOAST"));
      dispatch(setCartCount(0));
      queryClient.invalidateQueries({ queryKey: ["cart-list"] });
      handleShow();
    },
    onError: (e) => {
      toastAlert(
        "error",
        e?.response?.data?.message || "Could not complete payment"
      );
    },
  });

  const handleSampleDownload = async () => {
    try {
      let filePath = "";

      if (paidOrderId) {
        const resp = await customerOrderDownload(paidOrderId);
        filePath = resp?.data?.data || "";
      }

      if (!filePath) {
        const productFiles = (propertyId || [])
          .map((product) => product?.productFile)
          .filter(Boolean);
        if (productFiles.length) {
          const resp = await contactCsvDownload(productFiles.join(","), {
            ids: productFiles,
          });
          filePath = resp?.data?.data || "";
        }
      }

      if (!filePath) {
        toastAlert("error", "No spreadsheet file on this order");
        return;
      }

      dispatch(setCartCount(0));
      const url =
        String(filePath).startsWith("/") || String(filePath).startsWith("http")
          ? filePath
          : `/${filePath}`;
      window.location.assign(url);
      toastAlert("success", t("FILE_DOWNLOAD_TOAST"));
      handleClose();
      navigate(`/customer/file-list`);
    } catch (e) {
      toastAlert(
        "error",
        e?.response?.data?.message || "Download failed"
      );
    }
  };

  const displayTotal = Number(totalPrice || 0).toLocaleString();

  return (
    <>
      <Header />
      <section className="searchsection">
        <Container>
          <div className="sidebox overflow-hidden bg-white py-5">
            <Row>
              <Col md={8} className="mx-auto">
                <h4 className="text-center mb-lg-5 mb-3 text-uppercase">
                  {t("FILL")}
                </h4>
                <StripeCard />

                <Row>
                  {cardList?.length > 0
                    ? cardList.map((data) => {
                        const id = cardId(data);
                        const expiry = formatExpiry(data);
                        const selected = id === String(selectedCard);
                        return (
                          <div className="col-xl-6" key={id}>
                            <Card
                              className={`mb-3 p-0 payment-card-shell ${
                                selected ? "is-selected" : ""
                              }`}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedCard(id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedCard(id);
                                }
                              }}
                            >
                              <CardBody>
                                <div className="payment-card">
                                  <input
                                    className="radio-inner"
                                    type="radio"
                                    name="card-radio"
                                    value={id}
                                    id={`card-${id}`}
                                    checked={selected}
                                    onChange={() => setSelectedCard(id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label
                                    className="chck-label blk-txt"
                                    htmlFor={`card-${id}`}
                                  >
                                    <span className="card-icn-design">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-credit-card-2-back"
                                        viewBox="0 0 16 16"
                                        aria-hidden="true"
                                      >
                                        <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1z" />
                                        <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm13 2v5H1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm-1 9H2a1 1 0 0 1-1-1v-1h14v1a1 1 0 0 1-1 1z" />
                                      </svg>
                                    </span>
                                    {t("DEBIT_CARD")}
                                  </label>
                                  <div className="d-flex align-items-start justify-content-between">
                                    <div className="credit-card visa">
                                      <div className="credit-card-last4">
                                        •••• {data?.last4}
                                      </div>
                                      {expiry ? (
                                        <div className="credit-card-expiry">
                                          {expiry}
                                        </div>
                                      ) : null}
                                    </div>
                                    <p className="card-name">{data?.brand}</p>
                                  </div>
                                  <button
                                    className="delete-btn"
                                    title={t("DELETE")}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(id);
                                    }}
                                  >
                                    <FaTrashAlt />
                                  </button>
                                </div>
                              </CardBody>
                            </Card>
                          </div>
                        );
                      })
                    : null}
                </Row>

                <p className="text-center mt-4">
                  {t("CART_DETAIL")} <strong>€{displayTotal}</strong>
                  {t("CART_DETILS*")}
                  <Link
                    to="/terms-conditions"
                    className="text-underline"
                    target="_blank"
                  >
                    {t("TERMS_&_CONDITION")}
                  </Link>{" "}
                  &amp;
                  <Link
                    to="/privacy-policy"
                    className="text-underline"
                    target="_blank"
                  >
                    {t("PRIVACY_&_POLICY")}
                  </Link>{" "}
                  {t("CART_DETAIL_1")}
                </p>
              </Col>
            </Row>
            {cardList?.length > 0 ? (
              <div className="d-flex align-items-center justify-content-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  type="button"
                  className="add-modal-btn me-0"
                >
                  {t("BACK")}
                </button>
                <button
                  className="add-modal-btn me-0"
                  type="button"
                  disabled={payMutation.isPending || !selectedCard}
                  onClick={handlePayAmount}
                >
                  {t("PAY")}&nbsp;€{displayTotal}
                </button>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <Footer />
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <Modal.Header
            closeButton
            className="p-0 border-0 pt-4"
          ></Modal.Header>
          <Row>
            <Col md={10} className="mx-auto py-5 text-center">
              <img src="/pay.png" width={150} alt="" />
              <h5 className="mt-4 mb-4">
                {t("PAYMENT")} <br />
                {t("SUCCESSFULLY_DONE")}
              </h5>
              <button
                className="btn bg-green px-5"
                type="button"
                onClick={() => handleSampleDownload()}
              >
                {t("DOWNLOAD_CSV_FILE")}
              </button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      {isFetching ||
      payMutation?.isPending ||
      deleteSchedularList?.isPending ? (
        <Loader />
      ) : null}
    </>
  );
};

export default CheckoutForm;
