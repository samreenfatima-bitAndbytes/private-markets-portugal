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
import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Autocomplete from "react-google-autocomplete";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as yup from "yup";
import Loader from "../Loader/Loader";
import CustomSelect from "../components/CustomSelect";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import useDetails from "../hooks/useDetails";
import { login } from "../redux/features/authSlice";
import { customerEditProfile } from "../services/Services";
import { countryCode } from "../utils/CountryCode";
import { postalCodePattern, restrictAlpha } from "../utils/Functions";
import { mediaUrl } from "../utils/mediaUrl";

const AgentProfile = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const data = useDetails();
  const [editButton, setEdiButton] = useState(false);
  const mutation = useMutation({
    mutationFn: (payload) => customerEditProfile(payload),
    onSuccess: (resp) => {
      dispatch(login(resp?.data?.data));
      setEdiButton(false);
    },
  });
  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    touched,
    errors,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      profileImg: "",
      newPicked: "",
      CommercialName: "",
      CommercialAddress: "",
      countryCode: "",
      mobile: "",
      address: "",
      postalCode: "",
      terms: true,
    },
    validationSchema: yup.object().shape({
      firstName: yup
        .string()
        .required(t("FIRST_NAME_REQUIRED_FIELD"))
        .trim()
        .max(50),
      lastName: yup
        .string()
        .required(t("LAST_NAME_REQUIRED_FIELD"))
        .trim()
        .max(50),
      postalCode: yup
        .string()
        .required(t("POSTAL_CODE_VALIDATION"))
        .typeError("Invalid input")
        .trim()
        .matches(postalCodePattern, t("INVALID_POSTAL"))
        .test(
          "not-all-zeros",
          t("POSTAL_CODE_ZERO"),
          (value) => value !== "0000-000"
        ),
      mobile: yup
        .string()
        .nullable()
        .min(10, t("MOBILE_DIGITS"))
        .test(
          "not-all-zeros",
          t("MOBILE_DIGITST_ALL_ZEROS"),
          (value) => !/^(0{10})$/.test(value)
        ),
      newPicked: yup.mixed().when(([newPicked], schema) => {
        if (newPicked) {
          return yup
            .mixed()
            .test("type", t("IMAGE_VALIDATION"), function (value) {
              return (
                value &&
                (value.type === "image/jpg" ||
                  value.type === "image/png" ||
                  value.type === "image/jpeg")
              );
            });
        }
        return schema;
      }),
    }),

    onSubmit: async function (values) {
      let payload = new FormData();
      payload.append("firstName", values.firstName ?? "");
      payload.append("lastName", values.lastName ?? "");
      payload.append("CommercialName", values.CommercialName ?? "");
      payload.append("CommercialAddress", values.CommercialAddress ?? "");
      payload.append("mobile", values.mobile ?? "");
      payload.append("countryCode", values.countryCode ?? "");
      payload.append("address", values.address ?? "");
      payload.append("postalCode", values.postalCode ?? "");
      if (values?.newPicked) {
        payload.append("profileImg", values?.newPicked);
      }
      mutation.mutate(payload);
    },
  });

  useEffect(() => {
    setValues({
      ...values,
      firstName: data?.firstName,
      email: data?.email,
      profileImg: data?.profileImgId,
      lastName: data?.lastName,
      CommercialName: data?.CommercialName,
      mobile: data?.mobile,
      CommercialAddress: data?.CommercialAddress,
      countryCode: data?.countryCode,
      address: data?.address,
      postalCode: data?.postalCode,
    });
  }, []);

  const handlePlaces = (place) => {
    place?.address_components?.map((item) => {
      if (item?.types?.includes("administrative_area_level_3")) {
        setFieldValue("address", item?.long_name);
      }
      if (item?.types?.includes("postal_code")) {
        setFieldValue("postalCode", item?.long_name);
      }
    });
    setFieldValue("CommercialAddress", place?.formatted_address);
  };

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
                    {t("MY_PROFILE")}
                    <br />
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
                  {!editButton && (
                    <a
                      className="emp-hd-btn text-underline"
                      onClick={() => {
                        setEdiButton(true);
                      }}
                      style={{ cursor: "pointer" }}
                      title={t("EDIT_PROFILE")}
                    >
                      <svg
                        width="42"
                        height="42"
                        viewBox="0 0 42 42"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="42" height="42" rx="6" fill="#004aad" />
                        <g clipPath="url(#clip0_119_1046)">
                          <path
                            d="M23.7335 15.1912L13.2795 25.646C13.2269 25.6987 13.1889 25.7653 13.1708 25.8369L12.0121 30.4878C11.9774 30.6278 12.0185 30.7767 12.1207 30.8789C12.198 30.9562 12.3034 30.999 12.4111 30.999C12.4441 30.999 12.4779 30.9949 12.5107 30.9866L17.1616 29.8278C17.2341 29.8097 17.3 29.7719 17.3526 29.7193L27.8076 19.2652L23.7335 15.1912Z"
                            fill="white"
                          />
                          <path
                            d="M30.3973 13.7658L29.2336 12.6021C28.4558 11.8243 27.1003 11.8251 26.3234 12.6021L24.8979 14.0276L28.9718 18.1014L30.3973 16.676C30.7858 16.2876 30.9998 15.7707 30.9998 15.221C30.9998 14.6712 30.7858 14.1543 30.3973 13.7658Z"
                            fill="white"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_119_1046">
                            <rect
                              width="19"
                              height="19"
                              fill="white"
                              transform="translate(12 12)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
                  )}
                </div>

                {editButton ? (
                  <Form id="loginForm" onSubmit={handleSubmit}>
                    <div className="position-relative text-center mb-4">
                      <div className="circle mx-auto">
                        <img
                          src={
                            values.newPicked
                              ? URL.createObjectURL(values.newPicked)
                              : values.profileImg
                              ? mediaUrl(values?.profileImg)
                              : "/default.png"
                          }
                          className="profile-pic"
                          alt="Image"
                        />
                        <label className="p-image">
                          <svg
                            width="35"
                            height="35"
                            viewBox="0 0 35 35"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="17.5"
                              cy="17.5"
                              r="16.5"
                              fill="white"
                              stroke="#004aad"
                              strokeWidth="2"
                            />
                            <g clipPath="url(#clip0_119_1485)">
                              <path
                                d="M26.2077 23.0417C26.2077 23.4616 26.0409 23.8643 25.7439 24.1613C25.447 24.4582 25.0443 24.625 24.6243 24.625H10.3743C9.95442 24.625 9.5517 24.4582 9.25476 24.1613C8.95783 23.8643 8.79102 23.4616 8.79102 23.0417V14.3333C8.79102 13.9134 8.95783 13.5107 9.25476 13.2137C9.5517 12.9168 9.95442 12.75 10.3743 12.75H13.541L15.1243 10.375H19.8743L21.4577 12.75H24.6243C25.0443 12.75 25.447 12.9168 25.7439 13.2137C26.0409 13.5107 26.2077 13.9134 26.2077 14.3333V23.0417Z"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M17.5007 21.4583C19.2496 21.4583 20.6673 20.0406 20.6673 18.2917C20.6673 16.5428 19.2496 15.125 17.5007 15.125C15.7517 15.125 14.334 16.5428 14.334 18.2917C14.334 20.0406 15.7517 21.4583 17.5007 21.4583Z"
                                stroke="black"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_119_1485">
                                <rect
                                  width="19"
                                  height="19"
                                  fill="white"
                                  transform="translate(8 8)"
                                />
                              </clipPath>
                            </defs>
                          </svg>

                          <input
                            className="file-upload"
                            id="fileupload"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setFieldValue("newPicked", e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                      <span className="text-danger">
                        {touched?.newPicked && errors?.newPicked}
                      </span>
                    </div>
                    <Row>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("FIRST_NAME")}
                          </Form.Label>
                          <span className="text-danger">*</span>
                          <Form.Control
                            type="text"
                            className="form-control border-2 rounded-pill px-4"
                            name="firstName"
                            value={values?.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("ENTER_A_FIRST_NAME")}
                            maxLength={15}
                          />
                          <span className="text-danger">
                            {touched?.firstName && errors?.firstName}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("LAST_NAME")}
                          </Form.Label>
                          <span className="text-danger">*</span>

                          <Form.Control
                            type="text"
                            className="form-control border-2 rounded-pill px-4"
                            name="lastName"
                            value={values?.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("ENTER_A_LAST_NAME")}
                            maxLength={15}
                          />
                          <span className="text-danger">
                            {touched?.lastName && errors?.lastName}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("EMAIL_ADDRESS")}
                          </Form.Label>

                          <Form.Control
                            className="form-control border-2 rounded-pill px-4"
                            type="email"
                            name="email"
                            value={values?.email}
                            placeholder="Email address"
                            readOnly
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("COMMERCIAL_NAME")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="CommercialName"
                            className="form-control border-2 rounded-pill px-4"
                            value={values?.CommercialName}
                            placeholder={t("ENTER_A_COMMERCIAL_NAME")}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("COUNTRY_CODE")}
                          </Form.Label>
                          <CustomSelect
                            className="rounded-pill"
                            name="countryCode"
                            formikCompatible
                            value={values.countryCode ?? ""}
                            onChange={handleChange}
                            placeholder={t("SELECT_COUNTRY_CODE")}
                            aria-label={t("COUNTRY_CODE")}
                            options={[
                              {
                                value: "",
                                label: t("SELECT_COUNTRY_CODE"),
                              },
                              ...(countryCode?.map((data) => ({
                                value: data?.code,
                                label: `${data?.country} (${data?.code})`,
                              })) ?? []),
                            ]}
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("MOBILE_NUMBER")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="mobile"
                            className="form-control border-2 rounded-pill px-4"
                            value={values?.mobile}
                            placeholder={t("ENTER_A_MOBILE_NUMBER")}
                            onChange={handleChange}
                            onKeyPress={restrictAlpha}
                            onBlur={handleBlur}
                            maxLength={10}
                          />
                          <span className="text-danger">
                            {touched?.mobile && errors?.mobile}
                          </span>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("COMMERCIAL_ADDRESS")}
                          </Form.Label>
                          {(import.meta.env.VITE_APP_MAP_KEY || "").trim() ? (
                            <Autocomplete
                              apiKey={import.meta.env.VITE_APP_MAP_KEY}
                              placeholder={t("ENTER_A_COMMERCIAL_ADDRESS")}
                              className="form-control"
                              name="CommercialAddress"
                              defaultValue={values?.CommercialAddress}
                              onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                  e.preventDefault();
                                }
                              }}
                              options={{
                                types: [],
                              }}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              onPlaceSelected={(place) => {
                                handlePlaces(place);
                              }}
                            />
                          ) : (
                            <Form.Control
                              type="text"
                              name="CommercialAddress"
                              className="form-control"
                              value={values?.CommercialAddress || ""}
                              placeholder={t("ENTER_A_COMMERCIAL_ADDRESS")}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          )}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("LOCATION")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            className="form-control border-2 rounded-pill px-4"
                            value={values?.address}
                            placeholder={t("ENTER_A_LOCATION")}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-3">
                          <Form.Label className="fw-bolder">
                            {t("POSTALCODE")}
                          </Form.Label>
                          <span className="text-danger">*</span>
                          <Form.Control
                            type="text"
                            name="postalCode"
                            className="form-control border-2 rounded-pill px-4"
                            value={values?.postalCode}
                            placeholder={t("ENTER_A_POSTCODE")}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={10}
                          />
                          <span className="text-danger">
                            {touched?.postalCode && errors?.postalCode}
                          </span>
                        </div>
                      </Col>
                      <div className="text-2">
                        <div className="d-flex align-items-start">
                          <Form.Check
                            className="me-2"
                            type="checkbox"
                            id="remember"
                            checked={values?.terms === true}
                            name="terms"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="remember"
                          ></label>
                          <p>
                            {t("BY_CONTINUING,_YOU_AGREE_TO_OUR")}
                            <Link to="/terms-conditions" target="_blank">
                              {t("TERMS_&_CONDITION")}
                            </Link>
                            ,
                            <Link to="/privacy-policy" target="_blank">
                              {t("PRIVACY_&_POLICY")}.
                            </Link>
                          </p>
                        </div>
                      </div>
                    </Row>
                    <div className="text-end">
                      <button
                        className="btn btn-theme2 px-5 mt-3 "
                        type="submit"
                      >
                        {t("SAVE")}
                      </button>
                    </div>
                  </Form>
                ) : (
                  <Row>
                    <Col lg={3} md={4} className="mb-3 mb-md-0">
                      <div className="userprofile">
                        <img
                          src={
                            data?.profileImgId
                              ? mediaUrl(data?.profileImgId)
                              : "/default.png"
                          }
                          alt="Profile"
                        />
                      </div>
                    </Col>
                    <Col lg={9} md={8} className="min-w-0">
                      <div className="profile-data">
                        <h3 className="mb-0">
                          {data?.firstName} {data?.lastName}
                        </h3>
                        {data?.firstName ? (
                          <>
                            <svg
                              width="179"
                              height="2"
                              viewBox="0 0 179 2"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1 1H178"
                                stroke="#004aad"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </>
                        ) : (
                          ""
                        )}
                        <div className="mb-3">
                          <h6 className="font15 colorblue mb-2">
                            {t("EMAIL_ADDRESS")}:
                          </h6>
                          <p>{data?.email}</p>
                        </div>
                        {data?.CommercialName ? (
                          <div className="mb-3 mt-4">
                            <h6 className="font15 colorblue mb-0">
                              {t("COMMERCIAL_NAME")}:
                            </h6>
                            <p>{data?.CommercialName}</p>
                          </div>
                        ) : (
                          ""
                        )}

                        {data?.countryCode ? (
                          <div className="mb-3 mt-4">
                            <h6 className="font15 colorblue mb-0">
                              {t("COUNTRY_CODE")}:
                            </h6>
                            <p>{data?.countryCode}</p>
                          </div>
                        ) : (
                          ""
                        )}

                        {data?.mobile ? (
                          <div className="mb-3 mt-4">
                            <h6 className="font15 colorblue mb-0">
                              {t("MOBILE_NUMBER")}:
                            </h6>
                            <p>{data?.mobile}</p>
                          </div>
                        ) : (
                          ""
                        )}

                        {data?.CommercialAddress ? (
                          <div className="mb-3 mt-4">
                            <h6 className="font15 colorblue mb-0">
                              {t("COMMERCIAL_ADDRESS")}:
                            </h6>
                            <p>{data?.CommercialAddress}</p>
                          </div>
                        ) : (
                          ""
                        )}

                        {data?.address ? (
                          <div className="mb-3 mt-4">
                            <h6 className="font15 colorblue mb-0">
                              {t("LOCATION")}:
                            </h6>
                            <p>{data?.address}</p>
                          </div>
                        ) : (
                          ""
                        )}

                        {data?.postalCode ? (
                          <div className="mb-3 mt-4">
                            <h6 className="font15 colorblue mb-0">
                              {t("POSTALCODE")}:
                            </h6>
                            <p>{data?.postalCode}</p>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      {mutation?.isPending && <Loader/>}
    </>
  );
};

export default AgentProfile;
