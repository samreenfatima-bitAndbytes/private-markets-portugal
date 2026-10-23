/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useFormik } from "formik";
import { React, useEffect } from "react";
import { Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import CustomSelect from "../components/CustomSelect";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { linkRegrex, restrictAlpha } from "../utils/Functions";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import "./addlist.scss";

function Addlist2({ nextStep, prevStep, secondForm, setSecondForm, id }) {
  const { t, i18n } = useTranslation();

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    touched,
    errors,
    setValues,
    setFieldValue,
  } = useFormik({
    initialValues: secondForm,
    validationSchema: yup.object().shape({
      gross_area: yup.string().required(t("GROSS_VALIDATION")),
      net_area: yup.string().required(t("NET_VALIDATION")),
      link: yup
        .string()
        .required(t("LINK_VALIDATION"))
        .matches(linkRegrex, t("INVALID_LINK"))
        .trim(),
      reference: yup.string().required(t("REFERENCE_VALIDATION")),
      price: yup.string().required(t("PRICE_VALIDATION")),
      description: yup.string().required(t("DESCRIPTION_VALIDATION")).trim(),
    }),
    onSubmit: async function (params) {
      if (parseInt(params?.gross_area) < parseInt(params?.net_area)) {
        toastAlert("error", "Net Area Should be lower or same than Gross Area");
      }
      else {
        nextStep();
        setSecondForm(params);
      }
    },
  });

  if (id) {
    useEffect(() => {
      setValues((prev) => ({
        ...prev,
        type_of_real_estate: secondForm?.type_of_real_estate,
        condition: secondForm?.condition,
        net_area: secondForm?.net_area,
        gross_area: secondForm?.gross_area,
        link: secondForm?.link,
        reference: secondForm?.reference,
        energy_class: secondForm?.energy_class,
        position: secondForm?.position,
        other_features_real_estate: secondForm?.other_features_real_estate,
        other_features_building: secondForm?.other_features_building,
        price: secondForm?.price,
        building_fee: secondForm?.building_fee,
        description: secondForm?.description,
      }));
    }, [secondForm]);
  }

  const handleRealEstate = (e) => {
    if (values?.other_features_real_estate?.includes(e.target.value)) {
      return setFieldValue(
        "other_features_real_estate",
        values?.other_features_real_estate?.filter((i) => i !== e.target.value)
      );
    } else {
      return setFieldValue("other_features_real_estate", [
        ...values.other_features_real_estate,
        e.target.value,
      ]);
    }
  };

  const handleOtherFeatures = (e) => {
    if (values?.other_features_building?.includes(e.target.value)) {
      return setFieldValue(
        "other_features_building",
        values?.other_features_building?.filter((i) => i !== e.target.value)
      );
    } else {
      return setFieldValue("other_features_building", [
        ...values.other_features_building,
        e.target.value,
      ]);
    }
  };

  return (
    <>
      <Header />
      <section className="employee-dashbord">
        <Container>
          <Row>
            <Col lg={1}>{/* <UserSidebar /> */}</Col>
            <Col lg={10}>
              <div className="emp-dash-card sidebox p-4">
                <div className="emp-das-hd d-flex align-items-center justify-content-between mb-4">
                  <h4 className="emp-dash-title">
                    {id ? t("EDIT_PROPERTY") : t("ADD_PROPERTY")}
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
                </div>
                <div className="emp-dash-body cardbox mb-3">
                  <Form onSubmit={handleSubmit}>
                    <div className="steps fixed mb-5">
                      <ul>
                        <li className="active">
                          <span>1</span> {t("BASIC_INFORMATION")}
                        </li>
                        <li className="active">
                          <span>2</span> {t("DETAILS")}
                        </li>
                        <li>
                          <span>3</span> {t("PHOTOS")}
                        </li>
                      </ul>
                    </div>

                    <h5 className="text-center">
                      {t("FEATURES_OF_THE_FLAT")}
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
                    </h5>
                    <div className="form-group mb-4">
                      <label className="labelhead mb-2">
                        {t("TYPE_OF_FLAT_(OPTIONAL)")}
                      </label>

                      <div className="mb-3">
                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue(
                                "type_of_real_estate",
                                e.target.value
                              )
                            }
                            onBlur={handleBlur}
                            value={constant.HOUSE_DETACHED}
                            name="type_of_real_estate"
                            checked={
                              constant.HOUSE_DETACHED ==
                              values?.type_of_real_estate
                            }
                          />

                          <label>&nbsp;&nbsp; {t("FLAT_/_APARTMENT")}</label>
                        </Form.Group>

                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue(
                                "type_of_real_estate",
                                e.target.value
                              )
                            }
                            onBlur={handleBlur}
                            value={constant?.HOUSE_SEMI_DETACHED}
                            name="type_of_real_estate"
                            checked={
                              constant.HOUSE_SEMI_DETACHED ==
                              values?.type_of_real_estate
                            }
                          />
                          <label>&nbsp;&nbsp; {t("PENTHOUSE")}</label>
                        </Form.Group>
                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue(
                                "type_of_real_estate",
                                e.target.value
                              )
                            }
                            onBlur={handleBlur}
                            value={constant?.HOUSE_TERRACED}
                            name="type_of_real_estate"
                            checked={
                              constant.HOUSE_TERRACED ==
                              values?.type_of_real_estate
                            }
                          />
                          <label>&nbsp;&nbsp; {t("DUPLEX")}</label>
                        </Form.Group>
                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue(
                                "type_of_real_estate",
                                e.target.value
                              )
                            }
                            onBlur={handleBlur}
                            value={constant?.HOUSE_ANDER}
                            name="type_of_real_estate"
                            checked={
                              constant.HOUSE_ANDER ==
                              values?.type_of_real_estate
                            }
                          />
                          <label>
                            &nbsp;&nbsp; {t("STUDIO_APARTMENT/LOFT")}
                          </label>
                        </Form.Group>
                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue(
                                "type_of_real_estate",
                                e.target.value
                              )
                            }
                            onBlur={handleBlur}
                            value={constant?.HOUSE_SHOP}
                            name="type_of_real_estate"
                            checked={
                              constant.HOUSE_SHOP == values?.type_of_real_estate
                            }
                          />
                          <label>&nbsp;&nbsp;{t("SHOP")}</label>
                        </Form.Group>
                      </div>
                    </div>
                    <div className="form-group mb-4">
                      <label className="labelhead mb-2">{t("CONDITION")}</label>
                      <div className="mb-3">
                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue("condition", e.target.value)
                            }
                            onBlur={handleBlur}
                            value={constant.PROPERTY_NEED_RENOVATING}
                            name="condition"
                            checked={
                              constant.PROPERTY_NEED_RENOVATING ==
                              values?.condition
                            }
                          />

                          <label>&nbsp;&nbsp; {t("NEEDS_RENOVATING")}</label>
                        </Form.Group>

                        <Form.Group
                          className="d-flex"
                          controlId="formBasicRadio"
                        >
                          <Form.Check
                            type="radio"
                            onChange={(e) =>
                              setFieldValue("condition", e.target.value)
                            }
                            onBlur={handleBlur}
                            value={constant?.PROPERTY_GOOD_CONDITION}
                            name="condition"
                            checked={
                              constant.PROPERTY_GOOD_CONDITION ==
                              values?.condition
                            }
                          />
                          <label>&nbsp;&nbsp; {t("GOOD_CONDITION")}</label>
                        </Form.Group>
                      </div>
                    </div>
                    <Row>
                      <Col md={6}>
                        <div className="form-group mb-4 mt-4 ">
                          <label className="labelhead">
                            {t("GROSS_AREA_(M2)*")}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="gross_area"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("ENTER_A_GROSS_AREA")}
                            value={values?.gross_area}
                            onKeyPress={restrictAlpha}
                            maxLength={30}
                          />
                          <span className="text-danger">
                            {touched?.gross_area && errors?.gross_area}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-4 mt-4">
                          <label className="labelhead">
                            {t("NET_AREA_(M2)*")}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="net_area"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values?.net_area}
                            placeholder={t("ENTER_A_NET_AREA")}
                            onKeyPress={restrictAlpha}
                            maxLength={30}
                          />
                          <span className="text-danger">
                            {touched?.net_area && errors?.net_area}
                          </span>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="form-group mb-4 ">
                          <label className="labelhead">
                            {t("LINK*")}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="link"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("ENTER_A_LINK")}
                            value={values?.link}
                          />
                          <span className="text-danger">
                            {touched?.link && errors?.link}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-4 ">
                          <label className="labelhead">
                            {t("REFERENCE*")}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="reference"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("ENTER_A_REFERENCE")}
                            value={values?.reference}
                            maxLength={40}
                          />
                          <span className="text-danger">
                            {touched?.reference && errors?.reference}
                          </span>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <h5 className="text-center">
                          {t("ENERGY_PERFORMANCE_CERTIFICATE")}
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
                        </h5>

                        <div className="form-group mb-4">
                          <label>{t("ENERGY_EFFICIENCY_RATING")}</label>
                          <CustomSelect
                            name="energy_class"
                            formikCompatible
                            onChange={handleChange}
                            value={values?.energy_class ?? ""}
                            placeholder={t("ENTER_A_ENERGY_RATING")}
                            aria-label={t("ENERGY_EFFICIENCY_RATING")}
                            options={[
                              {
                                value: "",
                                label: t("ENTER_A_ENERGY_RATING"),
                              },
                              { value: "A", label: "A" },
                              { value: "B", label: "B" },
                              { value: "C", label: "C" },
                              { value: "D", label: "D" },
                              { value: "E", label: "E" },
                              { value: "F", label: "F" },
                              { value: "G", label: "G" },
                              {
                                value: "Not Available",
                                label: t("NOT_AVAILABLE"),
                              },
                            ]}
                          />
                        </div>
                        <br />
                        <div className="form-group mb-4">
                          <label className="labelhead">
                            {t("ORIENTATION_(OPTIONAL)")}
                          </label>
                          <div className="mb-3">
                            <Form.Group
                              className="d-flex"
                              controlId="formBasicRadio"
                            >
                              <Form.Check
                                type="radio"
                                onChange={(e) =>
                                  setFieldValue("position", e.target.value)
                                }
                                onBlur={handleBlur}
                                value={constant?.NORTH}
                                name="position"
                                checked={constant.NORTH == values?.position}
                              />

                              <label>&nbsp;&nbsp; {t("NORTH")}</label>
                            </Form.Group>

                            <Form.Group
                              className="d-flex"
                              controlId="formBasicRadio"
                            >
                              <Form.Check
                                type="radio"
                                onChange={(e) =>
                                  setFieldValue("position", e.target.value)
                                }
                                onBlur={handleBlur}
                                value={constant?.SOUTH}
                                name="position"
                                checked={constant.SOUTH == values?.position}
                              />
                              <label>&nbsp;&nbsp; {t("SOUTH")}</label>
                            </Form.Group>
                            <Form.Group
                              className="d-flex"
                              controlId="formBasicRadio"
                            >
                              <Form.Check
                                type="radio"
                                onChange={(e) =>
                                  setFieldValue("position", e.target.value)
                                }
                                onBlur={handleBlur}
                                value={constant?.EAST}
                                name="position"
                                checked={constant.EAST == values?.position}
                              />

                              <label>&nbsp;&nbsp; {t("EAST")}</label>
                            </Form.Group>
                            <Form.Group
                              className="d-flex"
                              controlId="formBasicRadio"
                            >
                              <Form.Check
                                type="radio"
                                onChange={(e) =>
                                  setFieldValue("position", e.target.value)
                                }
                                onBlur={handleBlur}
                                value={constant?.WEST}
                                name="position"
                                checked={constant.WEST == values?.position}
                              />

                              <label>&nbsp;&nbsp; {t("WEST")}</label>
                            </Form.Group>
                          </div>
                        </div>

                        <div className="form-group mb-4">
                          <label className="labelhead">
                            {t("OTHER_FEATURES_OF_YOUR_HOME_ORIENTATION")}
                          </label>

                          <div className="mb-3">
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Fitted wardrobes"
                                id="Fitted wardrobes"
                                value={t("FITTED_WARDROBES")}
                                checked={values?.other_features_real_estate?.includes(
                                  t("FITTED_WARDROBES")
                                )}
                                onChange={handleRealEstate}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Fitted wardrobes">
                                {t("FITTED_WARDROBES")}
                              </label>
                            </div>

                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Terrace"
                                id="Terrace"
                                value={t("TERRACE")}
                                checked={values?.other_features_real_estate?.includes(
                                  t("TERRACE")
                                )}
                                onChange={handleRealEstate}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Terrace">{t("TERRACE")}</label>
                            </div>
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Air conditioning"
                                id="Air conditioning"
                                value={t("AIR_CONDITIONING")}
                                checked={values?.other_features_real_estate?.includes(
                                  t("AIR_CONDITIONING")
                                )}
                                onChange={handleRealEstate}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Air conditioning">
                                {t("AIR_CONDITIONING")}
                              </label>
                            </div>
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Storeroom"
                                value={t("STOREROOM")}
                                checked={values?.other_features_real_estate?.includes(
                                  t("STOREROOM")
                                )}
                                onChange={handleRealEstate}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Storeroom">
                                {t("STOREROOM")}
                              </label>
                            </div>
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Balcony"
                                id="Balcony"
                                value={t("BALCONY")}
                                checked={values?.other_features_real_estate?.includes(
                                  t("BALCONY")
                                )}
                                onChange={(e) => {
                                  handleRealEstate(e);
                                }}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Balcony">{t("BALCONY")}</label>
                            </div>
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Parking space/Single garage"
                                id="Parking space/Single garage"
                                value={t("PARKING_SPACE/SINGLE_GARAGE")}
                                checked={values?.other_features_real_estate?.includes(
                                  t("PARKING_SPACE/SINGLE_GARAGE")
                                )}
                                onChange={(e) => {
                                  handleRealEstate(e);
                                }}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Parking space/Single garage">
                                {t("PARKING_SPACE/SINGLE_GARAGE")}
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="form-group mb-4">
                          <label className="labelhead">
                            {t("OTHER_FEATURES_OF_THE_BUILDING")}
                          </label>

                          <div className="mb-3">
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                id="Swimming pool"
                                name="Swimming pool"
                                value={t("SWIMMING_POOL")}
                                onChange={handleOtherFeatures}
                                checked={values?.other_features_building?.includes(
                                  t("SWIMMING_POOL")
                                )}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Swimming pool">
                                {t("SWIMMING_POOL")}
                              </label>
                            </div>
                            <div className="d-flex">
                              <Form.Check
                                type="checkbox"
                                name="Garden area"
                                id="Garden area"
                                value={t("GARDEN_AREA")}
                                onChange={handleOtherFeatures}
                                checked={values?.other_features_building?.includes(
                                  t("GARDEN_AREA")
                                )}
                              />
                              &nbsp;&nbsp;
                              <label htmlFor="Garden area">
                                {t("GARDEN_AREA")}
                              </label>
                            </div>
                          </div>
                        </div>
                        <br />
                      </Col>

                      <Col md={10}>
                        <h5 className="text-center">
                          {t("PRICE")}
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
                        </h5>
                        <p>
                          According to our data and for information purposes,
                          properties with these characteristics are worth
                          321,305{constant.EURO} on average (although they can
                          vary between 280,915{constant.EURO} and 370,065
                          {constant.EURO} ).
                        </p>
                      </Col>
                      <Col md={6}>
                        <div className="form-group mb-4">
                          <label className="labelhead">
                            {t("PRICE")}
                            <span className="text-danger">*</span>
                          </label>
                          <InputGroup className="mb-3 radius0">
                            <Form.Control
                              className="form-control"
                              type="text"
                              onKeyPress={restrictAlpha}
                              name="price"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values?.price}
                              placeholder={t("ENTER_A_PRICE")}
                              maxLength={20}
                      
                            />
                            <InputGroup.Text id="basic-addon2">
                              {t("EUROS")}
                            </InputGroup.Text>
                          </InputGroup>
                          <span className="text-danger">
                            {touched?.price && errors?.price}
                          </span>
                        </div>
                        <div className="form-group mb-4">
                          <label className="labelhead">
                            {t("BUILDING_FEE")}
                          </label>
                          <InputGroup className="mb-3 radius0">
                            <Form.Control
                              className="form-control"
                              type="text"
                              onKeyPress={restrictAlpha}
                              name="building_fee"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values?.building_fee}
                              placeholder={t("ENTER_A_BUILDING_FEE")}
                              maxLength={20}
                   
                            />
                            <InputGroup.Text id="basic-addon2">
                              {t("EUROS/MONTH")}
                            </InputGroup.Text>
                          </InputGroup>
                        </div>
                      </Col>

                      <Col md={10}>
                        <h4>
                          {t("DESCRIPTION*")}
                          <span className="text-danger">*</span>
                        </h4>
                        <div className="form-group mb-4">
                          <p>{t("USE_THIS_SPACE_TO_TALK_ABOUT_FEATURES")}</p>
                          <textarea
                            className="form-control"
                            row="5"
                            name="description"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values?.description}
                            placeholder={t("DESCRIPTION_PLACEHOLDER")}
                          ></textarea>
                          <span className="text-danger">
                            {touched?.description && errors?.description}
                          </span>
                        </div>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-between">
                      <button
                        onClick={prevStep}
                        className="btn btn-theme2 mb-3"
                      >
                        {t("BACK")}
                      </button>
                      <button
                        className="btn btn-theme2 mb-3 me-2"
                        type="submit"
                      >
                        {t("CONTINUE_UPLOAD_PHOTOS")}
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </>
  );
}

export default Addlist2;
