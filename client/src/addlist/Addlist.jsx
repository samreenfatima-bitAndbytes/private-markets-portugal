/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import Autocomplete from "react-google-autocomplete";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AsyncPaginate } from "react-select-async-paginate";
import * as yup from "yup";
import CustomSelect from "../components/CustomSelect";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  agentActiveProperty,
  agentAddProperty,
  agentUpdateProperty,
  districtList,
  municiplityList,
  placeList,
} from "../services/Services";
import { postalCodePattern, restrictAlpha } from "../utils/Functions";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import "./addlist.scss";

function Addlist({
  nextStep,
  firstForm,
  setFirstForm,
  setSecondForm,
  setThirdForm,
  id,
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: categoryList } = useQuery({
    queryKey: ["category-list"],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await agentActiveProperty(query);
      return resp?.data?.data ?? []
    },
  });

  const years = Array.from(
    { length: 50 },
    (_, index) => new Date().getFullYear() - index
  );
  const queryClient = useQueryClient();

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
    initialValues: firstForm,
    validationSchema: yup.object().shape({
      categoryId: yup.string().required(t("PROPERTY_REQUIRED_FIELD")),
      year_of_construction: yup
        .string()
        .required(t("CONSTRUCTION_REQUIRED_FIELD")),
      street: yup.string().label("Street").required(t("STREET_REQUIRED_FIELD")),
      baths: yup.string().label("Bathroom").required(t("BATH_REQUIRED_FIELD")),
      floor: yup.string().label("Floor").required(t("FLOOR_REQUIRED_FIELD")),
      rooms: yup
        .string()
        .label("Bedroom")
        .required(t("BEDROOM_REQUIRED_FIELD")),
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
    }),
    onSubmit: async function (params) {
      setFirstForm(params);
      nextStep();
    },
  });

  if (id !== undefined) {
    useEffect(() => {
      setValues((prev) => ({
        ...prev,
        categoryId: firstForm?.categoryId,
        year_of_construction: firstForm?.year_of_construction,
        street: firstForm?.street,
        building_no: firstForm?.building_no,
        municipality: {
          label: firstForm?.municipality?.label,
          value: firstForm?.municipality?.value,
        },
        place: {
          label: firstForm?.place?.label,
          value: firstForm?.place?.value,
        },
        district: {
          label: firstForm?.district?.label,
          value: firstForm?.district?.value,
        },
        postalCode: firstForm?.postalCode,
        baths: firstForm?.baths,
        floor: firstForm?.floor,
        rooms: firstForm?.rooms,
        elevator: firstForm?.elevator,
        latitude: firstForm?.latitude,
        longitude: firstForm?.longitude,
      }));
      addListFormik?.setValues({
        ...addListFormik?.values,
        categoryId: firstForm?.categoryId ?? "",
        description: firstForm?.description,
      });
    }, [firstForm]);
  }

  const handlePlaces = (place) => {
    place?.address_components?.map((item) => {
      if (item?.types?.includes("postal_code")) {
        setFieldValue("postalCode", item?.long_name);
      }
    });
    setFieldValue("street", place?.formatted_address);
    setFieldValue("latitude", place?.geometry?.location?.lat());
    setFieldValue("longitude", place?.geometry?.location?.lng());
  };

  const addListFormik = useFormik({
    initialValues: {
      categoryId: "",
      description: "",
    },
    validationSchema: yup.object().shape({
      description: yup.string().required().label("Description"),
    }),
    onSubmit: (values) => {
      const payload = new FormData();
      if (id) {
        payload.append("id", id);
      }
      payload.append("categoryId", values?.categoryId);
      payload.append("description", values?.description);
      listMutation.mutate(payload);
    },
  });
  const listMutation = useMutation({
    mutationFn: (payload) =>
      id ? agentUpdateProperty(payload) : agentAddProperty(payload),
    onSuccess: () => {
      id
        ? toastAlert("success", t("PROPERTY_UPDATE_TOAST"))
        : toastAlert("success", t("PROPERTY_ADD_TOAST"));

      queryClient.invalidateQueries({ queryKey: ["list"] });
      navigate(`/customer/property-list`);
      addListFormik.resetForm();
    },
  });
  const districtOptions = async (search, loadedOptions, { page }) => {
    let resp = await districtList(search, page);
    let array = await resp?.data?.data;
    return {
      options: array?.map((i) => ({
        label: i?.title,
        value: i?._id,
      })),
      hasMore: resp?.data?.data?.length > 0 ? true : false,
      additional: {
        page: page + 1,
      },
    };
  };
  const municipalityOptions = async (search, loadedOptions, { page }) => {
    let resp = await municiplityList(search, page, values?.district?.value);
    let array = await resp?.data?.data;
    return {
      options: array?.map((i) => ({
        label: i?.title,
        value: i?._id,
      })),
      hasMore: resp?.data?.data?.length > 0 ? true : false,
      additional: {
        page: page + 1,
      },
    };
  };
  const placeOptions = async (search, loadedOptions, { page }) => {
    let resp = await placeList(search, page, values?.municipality?.value);
    let array = await resp?.data?.data;
    return {
      options: array?.map((i) => ({
        label: i?.title,
        value: i?._id,
      })),
      hasMore: resp?.data?.data?.length > 0 ? true : false,
      additional: {
        page: page + 1,
      },
    };
  };
  return (
    <>
      <Header />
      <section className="employee-dashbord pt-0">
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
                    {values?.categoryId == "Business" ? (
                      <>
                        <div className="steps fixed mb-5">
                          <ul>
                            <li></li>
                            <li className="active">
                              <span>1</span> {t("BASIC_INFORMATION")}
                            </li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="steps fixed mb-5">
                          <ul>
                            <li className="active">
                              <span>1</span> {t("BASIC_INFORMATION")}
                            </li>
                            <li>
                              <span>2</span> {t("DETAILS")}
                            </li>
                            <li>
                              <span>3</span> {t("PHOTOS")}
                            </li>
                          </ul>
                        </div>
                      </>
                    )}

                    <h5 className="text-center">
                      {t("PUBLISH_YOUR_PROPERTY")}
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

                    <Row>
                      <Col md={8}>
                        <div class="form-group mb-4">
                          <label className="labelhead">
                            {t("PROPERTY_TYPE")}
                            <span className="text-danger">*</span>
                          </label>
                          <CustomSelect
                            name="categoryId"
                            formikCompatible
                            value={values?.categoryId ?? ""}
                            onChange={(e) => {
                              handleChange(e);
                              addListFormik?.setFieldValue(
                                "categoryId",
                                e?.target?.value
                              );
                            }}
                            placeholder={t("PROPERTY_TYPE*")}
                            aria-label={t("PROPERTY_TYPE")}
                            options={[
                              { value: "", label: t("PROPERTY_TYPE*") },
                              ...(categoryList?.map((data) => ({
                                value: data?.name,
                                label: data?.name,
                              })) ?? []),
                            ]}
                          />
                          <span className="text-danger">
                            {touched?.categoryId && errors?.categoryId}
                          </span>
                        </div>
                      </Col>
                    </Row>

                    {values?.categoryId == "Business" ? (
                      <>
                        <Row>
                          <Col md={10}>
                            <h4>
                              {t("DESCRIPTION*")}
                              <span className="text-danger">*</span>
                            </h4>
                            <div className="form-group mb-4">
                              <p>
                                {t("USE_THIS_SPACE_TO_TALK_ABOUT_FEATURES")}
                              </p>
                              <textarea
                                className="form-control"
                                row="5"
                                name="description"
                                onChange={addListFormik.handleChange}
                                onBlur={addListFormik.handleBlur}
                                value={addListFormik.values?.description}
                                placeholder={t("DESCRIPTION_PLACEHOLDER")}
                                maxLength={250}
                              ></textarea>
                              <span className="text-danger">
                                {addListFormik.touched?.description &&
                                  addListFormik.errors?.description}
                              </span>
                            </div>
                          </Col>
                        </Row>
                        <div className="d-flex justify-content-between">
                          <button
                            style={{ display: "hidden" }}
                            className="btn  mb-3"
                          ></button>
                          <button
                            className="btn btn-theme2 mb-3"
                            type="button"
                            onClick={addListFormik.handleSubmit}
                          >
                            {t("SUBMIT")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group mb-4">
                          <label className="labelhead">
                            {t("CONSTRUCTION_YEAR")}
                            <span className="text-danger">*</span>
                          </label>
                          <CustomSelect
                            name="year_of_construction"
                            formikCompatible
                            value={values?.year_of_construction ?? ""}
                            onChange={handleChange}
                            placeholder={t("CONSTRUCTION_YEAR*")}
                            aria-label={t("CONSTRUCTION_YEAR")}
                            options={[
                              {
                                value: "",
                                label: t("CONSTRUCTION_YEAR*"),
                              },
                              ...(years?.map((year) => ({
                                value: year,
                                label: String(year),
                              })) ?? []),
                            ]}
                          />
                          <span className="text-danger">
                            {touched?.year_of_construction &&
                              errors?.year_of_construction}
                          </span>
                        </div>
                        <Row>
                          <Col md={12}>
                            <div className="form-group mb-4 mt-4">
                              <label className="labelhead">
                                {t("STREET")}
                                <span className="text-danger">*</span>
                              </label>
                              {(import.meta.env.VITE_APP_MAP_KEY || "").trim() ? (
                                <Autocomplete
                                  apiKey={import.meta.env.VITE_APP_MAP_KEY}
                                  placeholder={t("STREET*")}
                                  name="street"
                                  className="form-control"
                                  value={values?.street}
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
                                <input
                                  className="form-control"
                                  type="text"
                                  name="street"
                                  placeholder={t("STREET*")}
                                  value={values?.street}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              )}

                              <span className="text-danger">
                                {touched?.street && errors?.street}
                              </span>
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <div className="form-group mb-4">
                              <label className="labelhead">
                                {t("BUILDING_NUMBER")}
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                name="building_no"
                                onChange={handleChange}
                                placeholder={t("ENTER_A_BUILDING_NUMBER")}
                                onBlur={handleBlur}
                                value={values?.building_no}
                                maxLength={20}
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="form-group mb-4">
                              <label className="labelhead">
                                {t("DISTRICT")}
                              </label>
                              <AsyncPaginate
                                value={values?.district}
                                loadOptions={districtOptions}
                                onChange={(e) => setFieldValue("district", e)}
                                additional={{
                                  page: 1,
                                }}
                                isClearable
                                placeholder={t("ENTER_A_DISTRICT")}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="form-group mb-4">
                              <label className="labelhead">
                                {t("MUNICIPALITY")}
                              </label>
                              <AsyncPaginate
                                value={values?.municipality}
                                loadOptions={municipalityOptions}
                                onChange={(e) =>
                                  setFieldValue("municipality", e)
                                }
                                additional={{
                                  page: 1,
                                }}
                                isClearable
                                placeholder={t("ENTER_A_MUNICIPALITY")}
                                isDisabled={
                                  values?.district?.value ? false : true
                                }
                                key={Math.random()}
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="form-group mb-4">
                              <label className="labelhead">{t("PLACE")}</label>
                              <AsyncPaginate
                                value={values?.place}
                                loadOptions={placeOptions}
                                onChange={(e) => setFieldValue("place", e)}
                                additional={{
                                  page: 1,
                                }}
                                isClearable
                                placeholder={t("ENTER_A_PLACE")}
                                isDisabled={
                                  values?.municipality?.value ? false : true
                                }
                                key={Math.random()}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="form-group mb-4">
                              <label className="labelhead">
                                {t("POSTALCODE")}
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                name="postalCode"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values?.postalCode}
                                placeholder={t("ENTER_A_POSTCODE")}
                                maxLength={20}
                              />
                              <span className="text-danger">
                                {touched?.postalCode && errors?.postalCode}
                              </span>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="form-group mb-4 mt-4">
                              <label className="labelhead">
                                {t("NUMBER_OF_FLOOR*")}
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                name="floor"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values?.floor}
                                placeholder={t("ENTER_A_NUMBER_OF_FLOOR")}
                                onKeyPress={restrictAlpha}
                                maxLength={4}
                              />
                              <span className="text-danger">
                                {touched?.floor && errors?.floor}
                              </span>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="form-group mb-4 mt-4 ">
                              <label className="labelhead">
                                {t("NUMBER_OF_BEDROOM*")}
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                name="rooms"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values?.rooms}
                                placeholder={t("ENTER_A_NUMBER_OF_BEDROOM")}
                                onKeyPress={restrictAlpha}
                                maxLength={4}
                              />
                              <span className="text-danger">
                                {touched?.rooms && errors?.rooms}
                              </span>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="form-group mb-4">
                              <label className="labelhead">
                                {t("NUMBER_OF_BATHROOM*")}
                                <span className="text-danger">*</span>
                              </label>
                              <input
                                className="form-control"
                                type="text"
                                name="baths"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values?.baths}
                                onKeyPress={restrictAlpha}
                                placeholder={t("ENTER_A_NUMBER_OF_BATHROOM")}
                                maxLength={4}
                              />
                              <span className="text-danger">
                                {touched?.baths && errors?.baths}
                              </span>
                            </div>
                          </Col>
                        </Row>

                        <div className="form-group mb-4">
                          <label className="labelhead">{t("ELEVATOR")}</label>
                          <div className="mb-3">
                            <Form.Group
                              className="d-flex"
                              controlId="formBasicRadio"
                            >
                              <Form.Check
                                type="radio"
                                onChange={(e) =>
                                  setFieldValue("elevator", e.target.value)
                                }
                                onBlur={handleBlur}
                                value={constant?.LIFT_YES}
                                name="elevator"
                                checked={constant.LIFT_YES == values?.elevator}
                              />

                              <label>&nbsp;&nbsp; {t("YES")}</label>
                            </Form.Group>

                            <Form.Group
                              className="d-flex"
                              controlId="formBasicRadio"
                            >
                              <Form.Check
                                type="radio"
                                onChange={(e) =>
                                  setFieldValue("elevator", e.target.value)
                                }
                                onBlur={handleBlur}
                                value={constant?.LIFT_NO}
                                name="elevator"
                                checked={constant.LIFT_NO == values?.elevator}
                              />
                              <label>&nbsp;&nbsp; {t("NO")}</label>
                            </Form.Group>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <button
                            style={{ display: "hidden" }}
                            className="btn  mb-3"
                          ></button>
                          <button className="btn btn-theme2 mb-3" type="submit">
                            {t("CONTINUE_LISTING_DETAILS")}
                          </button>
                        </div>
                      </>
                    )}
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

export default Addlist;
