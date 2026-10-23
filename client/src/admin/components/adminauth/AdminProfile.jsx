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
import { Col, Container, Form, Row, Table } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as yup from "yup";
import useDetails from "../../../hooks/useDetails";
import useSlider from "../../../hooks/useSlider";
import { login } from "../../../redux/features/authSlice";
import { customerEditProfile } from "../../../services/Services";
import { CameraIcon } from "../../../utils/Icons";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const AdminProfile = () => {
  const [editButton, setEdiButton] = useState(false);
  const dispatch = useDispatch();
  const isSlider = useSlider();
  const data = useDetails();
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
      email: "",
      about: "",
      profileImg: "",
      newPicked: "",
    },
    validationSchema: yup.object().shape({
      firstName: yup.string().label("Full name").required().trim().max(50),
      newPicked: yup.mixed().when(([newPicked], schema) => {
        if (newPicked) {
          return yup
            .mixed()
            .test(
              "type",
              "Please select jpg, png, jpeg format",
              function (value) {
                return (
                  value &&
                  (value.type === "image/jpg" ||
                    value.type === "image/png" ||
                    value.type === "image/jpeg")
                );
              }
            );
        }
        return schema;
      }),
    }),

    onSubmit: async function (values) {
      let payload = new FormData();
      payload.append("firstName", values.firstName ?? "");
      payload.append("about", values.about ?? "");
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
      about: data?.about,
      roleId: data?.roleId,
    });
  }, []);

  return (
    <>
      <div className="mainbox">
        <Sidebar />
        <div className={isSlider ? "body-content close" : "body-content open"}>
          <div className="admin-toolbar">
            <h2 className="mainhead">
              <Link to="/admin/dashboard" className="bread_color">
                Home
              </Link>{" "}
              / Admin Profile
            </h2>
          </div>

          <section className="inner-wrap admin-profile-wrap">
            <Container fluid className="px-0">
              <div className="custom-card">
                {!editButton && (
                  <div
                    className="edit-btn"
                    title="Edit profile"
                    onClick={() => {
                      setEdiButton(true);
                    }}
                  >
                    <FaPencilAlt />
                  </div>
                )}

                {editButton ? (
                  <Form onSubmit={handleSubmit}>
                    <Col lg={4} className="mx-auto">
                      <div className="user-image">
                        <div className="image-uploader">
                          <img
                            src={
                              values.newPicked
                                ? URL.createObjectURL(values.newPicked)
                                : values.profileImg
                                ? mediaUrl(values?.profileImg)
                                : "/default.png"
                            }
                            alt="Image"
                          />

                          <label className="icon">
                            <CameraIcon />
                          </label>
                          <Form.Control
                            name="profile_file"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setFieldValue("newPicked", e.target.files[0])
                            }
                          />
                          <div className="text-danger">
                            {touched?.newPicked && errors?.newPicked}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bolder">
                            Full name<span className="text-danger">*</span>
                          </Form.Label>

                          <Form.Control
                            type="text"
                            name="firstName"
                            value={values?.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter a full name"
                          />
                          <span className="text-danger">
                            {touched?.firstName && errors?.firstName}
                          </span>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bolder">Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={values?.email}
                            placeholder="Email"
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bolder">About</Form.Label>
                          <Form.Control
                            type="text"
                            rows={3}
                            name="about"
                            as={"textarea"}
                            maxLength={230}
                            value={values?.about}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="About"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Col lg={12} className="text-end">
                      <button type="submit" className="theme-btn">
                        Submit
                      </button>
                    </Col>
                  </Form>
                ) : (
                  <Row>
                    <Col xl={4} className="mx-auto">
                      <div className="admin-profile">
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
                    <Col xl={12}>
                      <Table responsive bordered>
                        <tbody>
                          <tr>
                            <th>Full Name</th>
                            <td>{data?.firstName}</td>
                          </tr>
                          <tr>
                            <th>Email</th>
                            <td>{data?.email}</td>
                          </tr>
                          <tr>
                            <th>Role</th>
                            <td>
                              {data?.roleId === constant.ADMIN && "Admin"}
                            </td>
                          </tr>
                          {data?.about && (
                            <tr>
                              <th>About</th>
                              <td>{data?.about}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                )}
              </div>
            </Container>
          </section>
        </div>
        <AdminFooter />
      </div>
    </>
  );
};

export default AdminProfile;
