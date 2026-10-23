/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import CustomSelect from "../../../components/CustomSelect";
import useSlider from "../../../hooks/useSlider";
import {
  adminAddCms,
  adminCmsView,
  adminUpdateCms,
} from "../../../services/AdminServices";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const AddCms = () => {
  const { id } = useParams();
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (id) {
    useQuery({
      queryKey: ["cms-detail", id],
      queryFn: async ({ queryKey }) => {
        const [_key, id] = queryKey;
        const resp = await adminCmsView(id);
        setValues({
          ...values,
          title: resp?.data?.data?.title,
          typeId: resp?.data?.data?.typeId,
          description: resp?.data?.data?.description,
          image: resp?.data?.data?.image,
        });
        return resp?.data?.data;
      },
    });
  }

  const mutation = useMutation({
    mutationFn: (payload) =>
      id ? adminUpdateCms(id, payload) : adminAddCms(payload),
    onSuccess: (resp) => {
      // Success actions
      toastAlert("success", resp?.data?.message);
      resetForm();
      navigate(`/admin/cms-list`);
      queryClient.invalidateQueries({ queryKey: ["cms-list"] });
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
      title: "",
      description: "",
      typeId: "",
      image: "",
      newPicked: "",
    },
    validationSchema: yup.object().shape({
      title: yup.string().required().label("Title").trim(),
      description: yup.string().trim().required().label("Description"),
      typeId: yup.string().trim().required().label("Type"),
      newPicked: yup.mixed().when("typeId", {
        is: (value) => value == constant.CMS_ABOUT,
        then: () =>
          yup
            .mixed()
            .test("required", "Image is required field", function (value) {
              return !!value || !!this.parent.image;
            })
            .test(
              "fileFormat",
              "Please select jpg, png, jpeg format",
              function (value) {
                if (!value) return true;
                return (
                  value &&
                  (value.type === "image/jpg" ||
                    value.type === "image/png" ||
                    value.type === "image/jpeg")
                );
              }
            ),
      }),
    }),
    onSubmit: async (values) => {
      let payload = new FormData();
      if (id) {
        payload.append("id", values.id ?? "");
      }
      payload.append("title", values.title ?? "");
      payload.append("description", values.description ?? "");
      payload.append("typeId", values.typeId ?? "");
      if (values?.newPicked) {
        payload.append("image", values?.newPicked);
      }
      mutation.mutate(payload);
    },
  });
  return (
    <div className="mainbox">
      <Sidebar />
      <div className={isSlider ? "body-content close" : "body-content open"}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mainhead mb-0">
            <Link to="/admin/dashboard" className="bread_color">
              Home
            </Link> / {id ? "Update Cms" : "Create cms"}
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
                        Title<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter a title"
                        name="title"
                        value={values?.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p className="text-danger">
                        {touched?.title && errors?.title}
                      </p>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bolder">
                        Type<span className="text-danger">*</span>
                      </Form.Label>
                      <CustomSelect
                        name="typeId"
                        formikCompatible
                        value={values?.typeId ?? ""}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue("newPicked", "");
                        }}
                        placeholder="-- Select Type --"
                        aria-label="Type"
                        options={[
                          { value: "", label: "-- Select Type --" },
                          {
                            value: constant.CMS_TERMS,
                            label: "Terms & Conditions",
                          },
                          {
                            value: constant.CMS_PRIVACY,
                            label: "Privacy Policy",
                          },
                          {
                            value: constant.CMS_ABOUT,
                            label: "About us",
                          },
                          {
                            value: constant.CMS_COOKIES_POLICY,
                            label: "Cookies Policy",
                          },
                        ]}
                      />
                      <p className="text-danger">
                        {touched?.typeId && errors?.typeId}
                      </p>
                    </Form.Group>
                  </Col>
                  <Col lg={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bolder">
                        Description<span className="text-danger">*</span>
                      </Form.Label>

                      <CKEditor
                        editor={ClassicEditor}
                        data={values?.description}
                        config={{
                          language: "en",
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                          ],
                        }}
                        onChange={(_, editor) => {
                          setFieldValue("description", editor.getData());
                        }}
                        onBlur={() => {
                          setFieldTouched("description", true);
                        }}
                      />
                      <p className="text-danger">
                        {touched?.description && errors?.description}
                      </p>
                    </Form.Group>
                  </Col>

                  {values?.typeId == constant.CMS_ABOUT ? (
                    <Col md={12}>
                      <Row>
                        <Form.Label className="fw-bolder">
                          About us image<span className="text-danger">*</span>
                        </Form.Label>
                        <Col md={3} className="mb-3">
                          <div className=" custom_upload d-flex gap-4 ">
                            <img
                              src={
                                values.newPicked
                                  ? URL.createObjectURL(values.newPicked)
                                  : values.image
                                  ? mediaUrl(values?.image)
                                  : "/static_image.jpg"
                              }
                              width="20px"
                              height="30px"
                              alt="Image"
                            />

                            <label
                              className="custom-image-upload"
                              htmlFor="file"
                            >
                              <div className="inner-box">
                                <span>Upload Image Here</span>
                                <input
                                  name="image"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "newPicked",
                                      e.target.files[0]
                                    )
                                  }
                                />
                              </div>
                            </label>
                          </div>
                          {touched.newPicked && errors.newPicked && (
                            <span className="text-danger">
                              {errors.newPicked}
                            </span>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  ) : (
                    ""
                  )}
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
export default AddCms;
