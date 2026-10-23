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
import { React, useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import Loader from "../Loader/Loader";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { agentAddProperty, agentUpdateProperty } from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import "./addlist.scss";
import { mediaUrl } from "../utils/mediaUrl";

function Addlist3({ prevStep, thirdForm, allValues, id }) {
  const navigate = useNavigate();
  const [coord, setCoord] = useState({
    latitude: 0,
    longitude: 0,
  });
  const { t, i18n } = useTranslation();

  const {
    handleSubmit,
    setFieldValue,
    values,
    errors,
    touched,
    setValues,
    resetForm,
  } = useFormik({
    initialValues: {
      ...thirdForm,
      picked: [],
      file: [],
    },
    validationSchema: yup.object().shape({
      file: yup
        .mixed()
        .when("picked", {
          is: (value) => !value?.length,
          then: () => yup.array().min(1, t("ONE_PHOTO_VIDEO_VALIDATION")),
        })
        .when(([file], schema) => {
          if (file?.length > 0) {
            return yup.array().of(
              yup
                .mixed()
                .test("fileType", t("UNSUPPORTED_FILE"), (value) => {
                  if (value) {
                    return [
                      "image/jpeg",
                      "image/png",
                      "video/mp4",
                      "application/pdf",
                    ].includes(value.type);
                  }
                  return true;
                })
                .test(
                  "is-valid-size",
                  "Max allowed size is 10 MB",
                  (value) => value && value.size <= 10000000
                )
            );
          }
          return schema;
        }),
    }),
    onSubmit: async () => {
      let payload = new FormData();
      if (id) {
        payload.append("id", id ?? "");
      }
      payload.append("categoryId", allValues?.categoryId ?? "");
      payload.append(
        "year_of_construction",
        allValues.year_of_construction ?? ""
      );
      payload.append("street", allValues.street ?? "");
      payload.append("building_no", allValues.building_no ?? "");
      payload.append("reference", allValues.reference ?? "");
      // payload.append("place", allValues.place ?? "");
      payload.append("place", allValues.place?.label ?? "");
      payload.append("municipality", allValues.municipality?.label ?? "");
      payload.append("district", allValues.district?.label ?? "");
      payload.append("postalCode", allValues.postalCode ?? "");
      payload.append("baths", allValues.baths ?? "");
      payload.append("floor", allValues.floor ?? "");
      payload.append("rooms", allValues.rooms ?? "");
      payload.append("elevator", allValues.elevator ?? "");
      payload.append("position", allValues.position ?? "");
      payload.append(
        "type_of_real_estate",
        allValues.type_of_real_estate ?? ""
      );
      payload.append("condition", allValues.condition ?? "");
      payload.append("net_area", allValues.net_area ?? "");
      payload.append("gross_area", allValues.gross_area ?? "");
      payload.append("link", allValues.link ?? "");
      payload.append("description", allValues.description ?? "");

      payload.append(
        "other_features_building",
        allValues?.other_features_building?.toString()
      );
      payload.append(
        "other_features_real_estate",
        allValues?.other_features_real_estate?.toString()
      );

      payload.append("price", allValues.price ?? "");
      payload.append("energy_class", allValues.energy_class ?? "");
      payload.append("building_fee", allValues.building_fee ?? "");
      payload.append("latitude", allValues.latitude);
      payload.append("longitude", allValues.longitude);
      if (values?.file?.length > 0) {
        values?.file.forEach((file) => {
          payload.append("propertyImgId", file);
          payload.append("fileType", file?.type);
        });
      }
      mutation.mutate(payload);
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      id ? agentUpdateProperty(payload) : agentAddProperty(payload),
    onSuccess: () => {
      id
        ? toastAlert("success", t("PROPERTY_UPDATE_TOAST"))
        : toastAlert("success", t("PROPERTY_ADD_TOAST"));
      resetForm();
      navigate(`/customer/property-list`);
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFieldValue("file", [...values?.file, ...files]);
  };

  const handleDeleteImage = (index) => {
    const files = [...values?.file];
    files.splice(index, 1);
    setFieldValue("file", files);
  };
  useEffect(() => {
    setValues({
      ...values,
      picked: thirdForm.picked,
      fileType: thirdForm?.fileType,
    });
  }, []);

  let getLocation = new Promise(function (myResolve, myReject) {
    // "Producing Code" (May take some time)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // when successful
        myResolve(position);
      });
    } else {
      myReject(); // when error
    }
  });

  useEffect(() => {
    getLocation.then((position) => {
      setCoord((prev) => ({
        ...prev,
        latitude: Number(position.coords.latitude),
        longitude: Number(position.coords.longitude),
      }));
    });
  }, []);

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
                          <span>1.</span>
                          {t("BASIC_INFORMATION")}
                        </li>
                        <li className="active">
                          <span>2.</span>
                          {t("DETAILS")}
                        </li>
                        <li className="active">
                          <span>3.</span> {t("PHOTOS")}
                        </li>
                      </ul>
                    </div>

                    <Row>
                      <Col md={12}>
                        <div className="form-group mb-4">
                          <h2>
                            {t(
                              "UPLOAD_IMAGES,_VIDEO_AND_PDF_OF_YOUR_PROPERTY*"
                            )}
                            <span className="text-danger">*</span>
                          </h2>

                          <div className="image-grid_1">
                            {values?.file?.length > 0
                              ? values?.file?.map((data, index) => (
                                  <div key={index + data.name}>
                                    <div className="img-block bg-gray border-0">
                                      {data?.type?.startsWith("image") && (
                                        <>
                                          <img
                                            className="img-fluid2"
                                            src={URL.createObjectURL(data)}
                                            width="100px"
                                            height="100px"
                                          />
                                        </>
                                      )}
                                      {data?.type?.startsWith("video") && (
                                        <video
                                          className="img-fluid2"
                                          loop
                                          autoPlay
                                          muted
                                          src={URL.createObjectURL(data)}
                                          width="100px"
                                          height="100px"
                                        />
                                      )}
                                      {data?.type?.startsWith(
                                        "application/pdf"
                                      ) && (
                                        <img
                                          className="img-fluid2"
                                          src="/pdf-icon.png"
                                          style={{ objectFit: "contain" }}
                                          width="100px"
                                          height="100px"
                                        />
                                      )}
                                      <button
                                        type="button"
                                        className="remove_img"
                                        onClick={() => handleDeleteImage(index)}
                                      >
                                        X
                                      </button>
                                    </div>
                                    <span className="text-danger ">
                                      {touched?.file &&
                                        Array.isArray(errors?.file) &&
                                        errors?.file[index]}
                                    </span>
                                  </div>
                                ))
                              : thirdForm?.picked?.map((file, index) => (
                                  <div key={index}>
                                    <div className="img-block bg-gray border-0">
                                      {file &&
                                        thirdForm?.fileType[index]?.includes(
                                          "video/mp4"
                                        ) && (
                                          <video
                                            className="img-fluid2"
                                            loop
                                            autoPlay
                                            muted
                                            src={
                                              file
                                                ? mediaUrl(file)
                                                : "/static_image.jpg"
                                            }
                                            width="100px"
                                            height="100px"
                                          />
                                        )}
                                      {file &&
                                        thirdForm?.fileType[index]?.includes(
                                          "image"
                                        ) && (
                                          <img
                                            className="img-fluid2"
                                            src={
                                              file
                                                ? mediaUrl(file)
                                                : "/static_image.jpg"
                                            }
                                            width="100px"
                                            height="100px"
                                          />
                                        )}
                                      {file &&
                                        thirdForm?.fileType[index]?.includes(
                                          "application/pdf"
                                        ) && (
                                          <img
                                            className="img-fluid2"
                                            src="/pdf-icon.png"
                                            style={{ objectFit: "contain" }}
                                            width="100px"
                                            height="100px"
                                          />
                                        )}
                                    </div>
                                  </div>
                                ))}

                            <div>
                              <div className="form-group">
                                <div className="upload-btn-wrapper">
                                  <button className="image-btn"> + </button>
                                  <input
                                    type="file"
                                    name="file"
                                    multiple
                                    accept="image/*, video/*, .pdf"
                                    onChange={handleImageChange}
                                    onClick={(e) => {
                                      e.target.value = null;
                                    }}
                                  />
                                </div>
                                <span className="text-danger">
                                  {touched?.file &&
                                    !Array.isArray(errors?.file) &&
                                    errors?.file}
                                </span>
                              </div>
                            </div>
                          </div>
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
                        onClick={handleSubmit}
                      >
                        {t("SUBMIT")}
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
      {mutation?.isPending && <Loader />}
    </>
  );
}

export default Addlist3;
