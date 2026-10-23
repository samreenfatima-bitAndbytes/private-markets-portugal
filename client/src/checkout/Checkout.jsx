/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { React, useState } from "react";
import { Col, Container, Form, FormGroup, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  contactCsvDownload,
  customerCardPayment,
  customerCartList,
} from "../services/Services";
import { restrictAlpha, restrictNum } from "../utils/Functions";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import "./checkout.scss";

function Checkout() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [propertyId, setPropertyId] = useState([]);
  const { data: cartList } = useQuery({
    queryKey: ["cart-list"],
    queryFn: async ({ queryKey }) => {
      const [_key] = queryKey;
      const resp = await customerCartList();
      setTotalPrice(resp?.data?.data?.total);
      return resp?.data?.data?.list;
    },
  });

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    touched,
    errors,
    resetForm,
  } = useFormik({
    initialValues: {
      cardNo: "",
      mm: "",
      yy: "",
      cvv: "",
      name: "",
      total: "",
    },
    validationSchema: yup.object().shape({
      cardNo: yup.string().required().label("Card Number"),
      mm: yup.string().trim().required().label("MM"),
      yy: yup.string().trim().required().label("YY"),
      cvv: yup.string().trim().required().label("CVV"),
      name: yup.string().trim().required().label("Holder name").trim(),
    }),
    onSubmit: async (value) => {
      let body = {
        cardNo: value?.cardNo,
        mm: value?.mm,
        yy: value?.yy,
        cvv: value?.cvv,
        name: value?.name,
        total: totalPrice,
      };
      mutation.mutate(body);
    },
  });
  const mutation = useMutation({
    mutationFn: (body) => customerCardPayment(body),
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      setPropertyId(resp?.data?.data?.propertyId);
      resetForm();
      handleShow();
    },
  });

  const handleSampleDownload = async () => {
    const resp = await contactCsvDownload(
      propertyId?.map((i) => i),
      { ids: propertyId?.map((i) => i) }
    );
    if (resp?.status === 200) {
      const filePath = resp?.data?.data;
      const url =
        String(filePath).startsWith("/") || String(filePath).startsWith("http")
          ? filePath
          : `/${filePath}`;
      window.location.assign(url);
      toastAlert("success", resp?.data?.message);
      handleClose();
      navigate(`/customer/file-list`);
    }
  };
  return (
    <>
      <Header />

      <section className="searchsection">
        <Container>
          <div className="sidebox overflow-hidden bg-white py-5">
            <Row>
              <Col md={8} className="mx-auto">
                <h4 className="text-center mb-lg-5  mb-3 text-uppercase">
                  Fill your card detail
                </h4>
                <Form>
                  <Row>
                    <Col md={12}>
                      <FormGroup className="mb-4 form-group">
                        <input
                          type="text"
                          name="cardNo"
                          placeholder="Card Number"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-control"
                          value={values?.cardNo}
                          maxLength={12}
                          onKeyPress={restrictAlpha}
                        />
                        <span className="text-danger">
                          {touched?.cardNo && errors?.cardNo}
                        </span>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-4 form-group">
                        <input
                          type="text"
                          name="mm"
                          placeholder="MM"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values?.mm}
                          className="form-control"
                          maxLength={2}
                          onKeyPress={restrictAlpha}
                        />
                        <span className="text-danger">
                          {touched?.mm && errors?.mm}
                        </span>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-4 form-group">
                        <input
                          type="text"
                          name="yy"
                          placeholder="YY"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-control"
                          value={values?.yy}
                          maxLength={2}
                          onKeyPress={restrictAlpha}
                        />
                        <span className="text-danger">
                          {touched?.yy && errors?.yy}
                        </span>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-4 form-group">
                        <input
                          type="text"
                          placeholder="CVV"
                          name="cvv"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values?.cvv}
                          maxLength={4}
                          onKeyPress={restrictAlpha}
                          className="form-control"
                        />
                        <span className="text-danger">
                          {touched?.cvv && errors?.cvv}
                        </span>
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup className="mb-4 form-group">
                        <input
                          type="text"
                          placeholder="Card Holder Name"
                          className="form-control"
                          value={values?.name}
                          name="name"
                          onKeyDown={restrictNum}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <span className="text-danger">
                          {touched?.name && errors?.name}
                        </span>
                      </FormGroup>
                    </Col>
                  </Row>
                  <button
                    className="btn btn-theme2 mx-auto px-5 d-block"
                    onClick={handleSubmit}
                    type="button"
                  >
                    Pay {constant.EURO}
                    {totalPrice ?? 0}
                  </button>
                </Form>
               
              </Col>
            </Row>
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
              <img src="../pay.png" width={150} />
              <h5 className="mt-4 mb-4">
                Payment <br />
                Successfully Done
              </h5>
              <button
                className="btn bg-green px-5"
                type="button"
                onClick={() =>
                  handleSampleDownload(values?.propertyId, values?.propertyId)
                }
              >
                Download CSV File Now
              </button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
}
export default Checkout;
