/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import Loader from "../Loader/Loader";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import { login } from "../redux/features/authSlice";
import { changePassword } from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import "./changepassword.scss";

const ChangePassword = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const [showPassOld, setShowPassOld] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    touched,
    errors,
    resetForm,
  } = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: yup.object().shape({
      oldPassword: yup.string().required(t("OLD_PASSWORD_REQUIRED_FIELD")),
      newPassword: yup
        .string()
        .required(t("NEW_PASSWORD_REQUIRED_FIELD"))
        .matches(
          /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/,
          t("PASSWORD_VALIDATION")
        ),
      confirmPassword: yup
        .string()
        .required(t("CONFIRM_PASSWORD_REQUIRED_FIELD"))
        .oneOf([yup.ref("newPassword"), null], t("NEW_PASSWORD_CONFIRM_MATCH")),
    }),

    onSubmit: (values) => {
      let body = {
        password: values?.newPassword,
        oldPassword: values?.oldPassword,
      };
      changePasswordMutation.mutate(body);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (body) => changePassword(body),
    onSuccess: () => {
      toastAlert("success", t("PASSWORD_TOAST"));
      resetForm();
      localStorage.clear();
      dispatch(login(""));
    },
  });
  return (
    <>
      <Header />

      <section className="employee-dashbord">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <UserSidebar />
            </div>

            <div className="col-lg-9">
              <div className="emp-dash-card sidebox p-4">
                <div className="emp-das-hd d-flex align-items-center justify-content-between mb-4">
                  <h4 className="emp-dash-title">
                    {t("CHANGE_PASSWORD")} <br />
                    <svg
                      width="119"
                      height="2"
                      viewBox="0 0 119 2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1H118"
                        stroke="#004aad"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </h4>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col lg={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bolder">
                          {t("OLD_PASSWORD")}
                        </Form.Label>
                        <span className="text-danger">*</span>
                        <div className="password-input-wrap">
                          <Form.Control
                            type={showPassOld ? "text" : "password"}
                            placeholder={t("ENTER_OLD_PASSWORD")}
                            name="oldPassword"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values?.oldPassword}
                          />
                          <span
                            className="eye-icon"
                            onClick={() => setShowPassOld((v) => !v)}
                            role="button"
                            tabIndex={0}
                            aria-label={
                              showPassOld ? "Hide password" : "Show password"
                            }
                          >
                            {showPassOld ? <FaEye /> : <FaEyeSlash />}
                          </span>
                        </div>
                        <span className="text-danger">
                          {touched?.oldPassword && errors?.oldPassword}
                        </span>
                      </Form.Group>
                    </Col>
                    <Col lg={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bolder">
                          {t("NEW_PASSWORD")}
                        </Form.Label>
                        <span className="text-danger">*</span>
                        <div className="password-input-wrap">
                          <Form.Control
                            type={showPassNew ? "text" : "password"}
                            placeholder={t("ENTER_NEW_PASSWORD")}
                            name="newPassword"
                            value={values?.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <span
                            className="eye-icon"
                            onClick={() => setShowPassNew((v) => !v)}
                            role="button"
                            tabIndex={0}
                            aria-label={
                              showPassNew ? "Hide password" : "Show password"
                            }
                          >
                            {showPassNew ? <FaEye /> : <FaEyeSlash />}
                          </span>
                        </div>
                        <span className="text-danger">
                          {touched?.newPassword && errors?.newPassword}
                        </span>
                      </Form.Group>
                    </Col>
                    <Col lg={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bolder">
                          {t("CONFIRM_PASSWORD")}
                        </Form.Label>
                        <span className="text-danger">*</span>
                        <div className="password-input-wrap">
                          <Form.Control
                            type={showPassConfirm ? "text" : "password"}
                            placeholder={t("ENTER_A_CONFIRM_PASSWORD")}
                            name="confirmPassword"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values?.confirmPassword}
                          />
                          <span
                            className="eye-icon"
                            onClick={() => setShowPassConfirm((v) => !v)}
                            role="button"
                            tabIndex={0}
                            aria-label={
                              showPassConfirm
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPassConfirm ? <FaEye /> : <FaEyeSlash />}
                          </span>
                        </div>
                        <span className="text-danger">
                          {touched?.confirmPassword && errors?.confirmPassword}
                        </span>
                      </Form.Group>
                    </Col>
                    <div className="text-end">
                      <button
                        className="btn btn-theme2"
                        type="button"
                        onClick={handleSubmit}
                      >
                        {t("SAVE_CHANGES")}
                      </button>
                    </div>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      {changePasswordMutation?.isPending && <Loader />}
    </>
  );
};

export default ChangePassword;
