/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useFormik } from "formik";
import * as yup from "yup";
import useSlider from "../../../hooks/useSlider";
import {
  adminAddProduct,
  adminUpdateProperty,
  adminViewProduct,
} from "../../../services/AdminServices";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { constant } from "../../../utils/constant";
import { toastAlert } from "../../../utils/SweetAlert";
import { restrictAlpha } from "../../../utils/Functions";
import { mediaUrl } from "../../../utils/mediaUrl";

const AddProduct = () => {
  const { id } = useParams();
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (id) {
    useQuery({
      queryKey: ["cms-detail", id],
      queryFn: async ({ queryKey }) => {
        const [_key, id] = queryKey;
        const resp = await adminViewProduct(id);
        setValues({
          ...values,
          productName: resp?.data?.data?.productName,
          price: resp?.data?.data?.price,
          newPicked: resp?.data?.data?.productImg, // Set newPicked if productImg exists
          productImg: resp?.data?.data?.productImg,
          productFile: resp?.data?.data?.productFile,
        });
        return resp?.data?.data;
      },
    });
  }

  const mutation = useMutation({
    mutationFn: (payload) =>
      id ? adminUpdateProperty(id, payload) : adminAddProduct(payload),
    onSuccess: (resp) => {
    
      toastAlert("success", resp?.data?.message);
      resetForm();
      navigate(`/admin/product-list`);
      queryClient.invalidateQueries({ queryKey: ["product-list"] });
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
    setValues,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    initialValues: {
      productName: "",
      price: "",
      productFile: "",
      filePicked: "",
      file: [],
      newPicked: [],
    },
    validationSchema: yup.object().shape({
      productName: yup.string().required().label("Product name").trim(),
      price: yup
        .number()
        .required()
        .label("Price")
        .min(0.01, "Price cannot be zero or less than zero")
        .typeError("Invalid input"),
      // Product "file" = spreadsheet package (xlsx/xls/csv), NOT a photo
      filePicked: yup
        .mixed()
        .test("required", "Spreadsheet file is required (.xlsx / .xls / .csv)", function (value) {
          return !!value || !!this.parent.productFile;
        })
        .test("fileFormat", "Please upload an Excel or CSV file (.xlsx, .xls, .csv)", function (value) {
          if (!value) return true;
          const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
            "application/csv",
            "text/plain",
          ];
          const name = (value.name || "").toLowerCase();
          const byExt =
            name.endsWith(".xlsx") ||
            name.endsWith(".xls") ||
            name.endsWith(".csv");
          return allowedTypes.includes(value.type) || byExt;
        }),

      // Product images = photos (jpeg/png/webp) — at least one
      file: yup
        .mixed()
        .when("newPicked", {
          is: (value) => !value?.length,
          then: () =>
            yup.array().min(1, "At least one product photo is required (JPG/PNG)"),
        })
        .when(([file], schema) => {
          if (file?.length > 0) {
            return yup.array().of(
              yup.mixed().test("fileType", "Use JPG, PNG, or WEBP images only", (value) => {
                if (value) {
                  return [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/jpg",
                  ].includes(value.type);
                }
                return true;
              })
            );
          }
          return schema;
        }),
    }),
    onSubmit: async (values) => {
      let payload = new FormData();
      if (id) {
        payload.append("id", values.id ?? "");
      }
      payload.append(
        "productName",
        values.productName.replace(/\s+/g, " ").trim()
      );
      payload.append("price", values.price ?? "");

      if (values?.file?.length > 0) {
        values?.file.forEach((file) => {
          payload.append("productImg", file);
        });
      }

      if (values?.filePicked) {
        payload.append("productFile", values?.filePicked);
      }

      mutation.mutate(payload);
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
      newPicked: values.newPicked,
    });
  }, []);

  return (
    <div className="mainbox">
      <Sidebar />
      <div className={isSlider ? "body-content close" : "body-content open"}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mainhead mb-0">
            <Link to="/admin/dashboard" className="bread_color">
              Home
            </Link>{" "}
            / {id ? "Update Product" : "Create Product"}
          </h2>
          <div className="text-end mx-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="theme-btn btn-md mb-2 mx-4"
            >
              Back
            </button>
          </div>
        </div>
        <section className="inner-wrap">
          <Container fluid className="px-0">
            <div className="custom-card">
              <Form>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bolder">
                        Product name<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter a product name"
                        name="productName"
                        value={values?.productName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={25}
                      />
                      <p className="text-danger">
                        {touched?.productName && errors?.productName}
                      </p>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bolder">
                        ({constant.EURO})Price
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter a Price"
                        name="price"
                        value={values?.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyPress={restrictAlpha}
                        maxLength={10}
                      />
                      <p className="text-danger">
                        {touched?.price && errors?.price}
                      </p>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Row>
                      <Form.Label className="fw-bolder">
                        Product spreadsheet<span className="text-danger">*</span>
                      </Form.Label>
                      <p className="text-muted small mb-2">
                        This field needs an Excel/CSV data file (.xlsx / .xls / .csv) — not a photo.
                        Sample file:{" "}
                        <a href="/sample-product-data.xlsx" download>
                          sample-product-data.xlsx
                        </a>
                      </p>
                      <Col md={3} className="mb-3">
                        <div className=" custom_upload d-flex gap-4 ">
                          {values.filePicked && (
                            <img
                              src={"/xlsl.png"}
                              width="20px"
                              height="30px"
                              alt="Spreadsheet"
                            />
                          )}

                          {values?.productFile && (
                            <img
                              className="img-fluid2"
                              src="/xlsl.png"
                              width="20px"
                              height="30px"
                              alt="Spreadsheet"
                            />
                          )}

                          <label className="custom-image-upload" htmlFor="productSpreadsheet">
                            <div className="inner-box">
                              <span>
                                {values.filePicked
                                  ? values.filePicked.name
                                  : "Upload Excel / CSV"}
                              </span>
                              <input
                                id="productSpreadsheet"
                                name="productFile"
                                type="file"
                                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                onChange={(e) =>
                                  setFieldValue("filePicked", e.target.files[0])
                                }
                              />
                            </div>
                          </label>
                        </div>
                        {touched.filePicked && errors.filePicked && (
                          <span className="text-danger">
                            {errors.filePicked}
                          </span>
                        )}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={12}>
                    <Row>
                      <Col md={12}>
                        <Form.Label className="fw-bolder">
                          Product photo(s)<span className="text-danger">*</span>
                        </Form.Label>
                        <p className="text-muted small mb-2">
                          Upload at least one JPG or PNG image using the + button.
                        </p>

                        <div className="image-grid">
                          {values?.file?.length > 0
                            ? values?.file?.map((data, index) => (
                                <div key={index + data.name}>
                                  <div className="img-block bg-gray border-0">
                                    <>
                                      <img
                                        className="img-fluid2"
                                        src={URL.createObjectURL(data)}
                                        width="100px"
                                        height="100px"
                                      />
                                    </>

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
                            : values?.newPicked?.map((file, index) => (
                                <div key={index}>
                                  <div className="img-block bg-gray border-0">
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
                                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
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
                      </Col>
                    </Row>
                  </Col>

                  <div className="text-end mt-4">
                    <button
                      className="theme-btn btn-md mb-2"
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </Row>
              </Form>
            </div>
          </Container>
        </section>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AddProduct;
