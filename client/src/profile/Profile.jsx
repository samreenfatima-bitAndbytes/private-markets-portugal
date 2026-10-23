/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { React, useEffect, useState } from "react";
import { mediaUrl } from "../utils/mediaUrl";
import {
  Modal,
  Tab,
  Table,
  Tabs,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import CustomSelect from "../components/CustomSelect";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "./profile.scss";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as yup from "yup";
import useDetails from "../hooks/useDetails";
import { customerEditProfile } from "../services/Services";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice";
import { constant } from "../utils/constant";

function Profile() {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const data = useDetails();

  const [showOne, setShowOne] = useState(false);
  const handleCloseOne = () => setShowOne(false);
  const handleShowOne = () => setShowOne(true);

  const [editButton, setEdiButton] = useState(false);
  const [editAddition, setEditAddition] = useState(false);
  const mutation = useMutation({
    mutationFn: (payload) => customerEditProfile(payload),
    onSuccess: (resp) => {
      handleClose();
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
      fullName: "",
      email: data?.email,
      profileImg: "",
      newPicked: "",
    },
    validationSchema: yup.object().shape({
      fullName: yup.string().label("Full Name").required().trim().max(50),

      newPicked: yup
        .mixed()
        .test("required", "Image is required", function (value) {
          return !!value || !!this.parent.profileImg;
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

    onSubmit: async function (values) {
      let payload = new FormData();
      payload.append("fullName", values.fullName ?? "");
      if (values?.newPicked) {
        payload.append("profileImg", values?.newPicked);
      }
      mutation.mutate(payload);
    },
  });

  useEffect(() => {
    setValues({
      ...values,
      fullName: data?.fullName,
      email: data?.email,
      profileImg: data?.profileImgId,
    });
  }, []);

  const additionInfoFormik = useFormik({
    initialValues: {
      gender: "",
      age: "",
      occupation: "",
      other_Field: {
        smoke: false,
        pet: false,
        room: false,
        minimum_stay: false,
        social_media: false,
      },
    },
    validationSchema: yup.object().shape({
      gender: yup.string().label("Gender").required().trim().max(50),
      age: yup.string().label("Age").required().trim().max(50),
      occupation: yup.string().label("occupation").required().trim().max(50),
    }),

    onSubmit: async function (values) {
      let payload = new FormData();
      payload.append("gender", values.gender ?? "");
      payload.append("occupation", values.occupation ?? "");
      payload.append("age", values.age ?? "");
      payload.append("other_Field", JSON.stringify(values?.other_Field ?? ""));

      additionmutation.mutate(payload);
    },
  });

  const additionmutation = useMutation({
    mutationFn: (payload) => customerEditProfile(payload),
    onSuccess: (resp) => {
      handleCloseOne();
      dispatch(login(resp?.data?.data));
      setEditAddition(false);
    },
  });

  useEffect(() => {
    additionInfoFormik.setValues({
      ...additionInfoFormik.values,
      gender: data?.gender,
      age: data?.age,
      occupation: data?.occupation,
    });
  }, []);

  const handleOther = (e) => {
    additionInfoFormik.setValues((prev) => ({
      ...prev,
      other_Field: {
        ...prev.other_Field,
        [e.target.name]: e.target.checked,
      },
    }));
  };
  return (
    <>
      <Header />

      <section className="employee-dashbord">
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <div className="emp-dash-card">
                <Tabs
                  defaultActiveKey="profile"
                  id="my-file-tabs"
                  className="mb-3"
                >
                  <Tab eventKey="profile" title="Profile">
                    {editButton ? (
                      ""
                    ) : (
                      <div className="inner-box sidebox p-4 mb-4 bg-white">
                        <div className="inner-head mb-4">
                          <h5 className="mb-0">Name and Photo</h5>
                          <p className="mb-0">
                            This information will only be shown when you contact
                            an advertiser or publish a listing on private
                            markets
                          </p>
                        </div>
                        <div className="inner-body">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={
                                data?.profileImgId
                                  ? mediaUrl(data?.profileImgId)
                                  : "/default.png"
                              }
                              alt="Image"
                            />
                            <div className="info">
                              <h5>{data?.fullName}</h5>
                              <p>{data?.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="inner-ftr">
                          <Link onClick={handleShow}>
                            <FaEdit /> Edit Data
                          </Link>
                        </div>
                      </div>
                    )}
                    {editAddition ? (
                      ""
                    ) : (
                      <div className="inner-box sidebox p-4 bg-white">
                        <div className="inner-head mb-4">
                          <h5 className="mb-0">Profile for reenting a room</h5>
                          <p className="mb-0">
                            You will be able to sharee this data when contacting
                            room advertisers.
                          </p>
                        </div>
                        <div className="inner-body">
                          <ul>
                            <li>
                              {data?.gender === constant.MALE && "MALE"}
                              {data?.gender === constant.FEMALE && "FEMALE"}
                              {data?.gender === constant.OTHERS && "OTHERS"}
                            </li>
                            <li>{data?.age} years</li>
                            <li>{data?.occupation}</li>
                            <li className="text-muted">
                              {data?.other_Field?.smoke === true &&
                                "Do you smoke at Home?"}
                            </li>
                            <li className="text-muted">
                              {data?.other_Field?.pet === true &&
                                "Do you have a pet?"}
                            </li>
                            <li className="text-muted">
                              {data?.other_Field?.room === true &&
                                "Who will live in the room?"}
                            </li>
                            <li className="text-muted">
                              {" "}
                              {data?.other_Field?.minimum_stay === true &&
                                "Minimum Stay?"}
                            </li>
                            <li className="text-muted">
                              {" "}
                              {data?.other_Field?.social_media === true &&
                                "Social Media?"}
                            </li>
                          </ul>
                        </div>
                        <div className="inner-ftr d-flex align-items-center justify-content-between">
                          <Link onClick={handleShowOne}>
                            <FaEdit /> Edit Profile
                          </Link>
                          <Link>
                            <FaTrash /> Delete Profile
                          </Link>
                        </div>
                      </div>
                    )}
                  </Tab>
                  <Tab eventKey="my-files" title="My Files">
                    <div className="emp-dash-body">
                      <div className="table-responsive">
                        <Table className="table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>File Name</th>
                              <th>Purchase Date</th>
                              <th>Amount</th>
                              <th>File Download</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>2344</td>
                              <td>Real Estate CSV File</td>
                              <td>02-02-2024</td>
                              <td>$50.00</td>
                              <td>
                                <div className="action-btn-list d-flex align-items-center justify-content-center">
                                  <a
                                    className="acton-btn btn bg-success px-2"
                                    href="#"
                                  >
                                    <svg
                                      width="21"
                                      height="21"
                                      viewBox="0 0 21 21"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.375 13.125V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V13.125M6.125 8.75L10.5 13.125M10.5 13.125L14.875 8.75M10.5 13.125V2.625"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2344</td>
                              <td>Real Estate CSV File</td>
                              <td>02-02-2024</td>
                              <td>$50.00</td>
                              <td>
                                <div className="action-btn-list d-flex align-items-center justify-content-center">
                                  <a
                                    className="acton-btn btn bg-success px-2"
                                    href="#"
                                  >
                                    <svg
                                      width="21"
                                      height="21"
                                      viewBox="0 0 21 21"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.375 13.125V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V13.125M6.125 8.75L10.5 13.125M10.5 13.125L14.875 8.75M10.5 13.125V2.625"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2344</td>
                              <td>Real Estate CSV File</td>
                              <td>02-02-2024</td>
                              <td>$50.00</td>
                              <td>
                                <div className="action-btn-list d-flex align-items-center justify-content-center">
                                  <a
                                    className="acton-btn btn bg-success px-2"
                                    href="#"
                                  >
                                    <svg
                                      width="21"
                                      height="21"
                                      viewBox="0 0 21 21"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.375 13.125V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V13.125M6.125 8.75L10.5 13.125M10.5 13.125L14.875 8.75M10.5 13.125V2.625"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2344</td>
                              <td>Real Estate CSV File</td>
                              <td>02-02-2024</td>
                              <td>$50.00</td>
                              <td>
                                <div className="action-btn-list d-flex align-items-center justify-content-center">
                                  <a
                                    className="acton-btn btn bg-success px-2"
                                    href="#"
                                  >
                                    <svg
                                      width="21"
                                      height="21"
                                      viewBox="0 0 21 21"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.375 13.125V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V13.125M6.125 8.75L10.5 13.125M10.5 13.125L14.875 8.75M10.5 13.125V2.625"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2344</td>
                              <td>Real Estate CSV File</td>
                              <td>02-02-2024</td>
                              <td>$50.00</td>
                              <td>
                                <div className="action-btn-list d-flex align-items-center justify-content-center">
                                  <a
                                    className="acton-btn btn bg-success px-2"
                                    href="#"
                                  >
                                    <svg
                                      width="21"
                                      height="21"
                                      viewBox="0 0 21 21"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.375 13.125V16.625C18.375 17.0891 18.1906 17.5342 17.8624 17.8624C17.5342 18.1906 17.0891 18.375 16.625 18.375H4.375C3.91087 18.375 3.46575 18.1906 3.13756 17.8624C2.80937 17.5342 2.625 17.0891 2.625 16.625V13.125M6.125 8.75L10.5 13.125M10.5 13.125L14.875 8.75M10.5 13.125V2.625"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* Edit Data Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col lg={6}>
              <Form.Group className="mb-4">
                <Form.Label>Full Name</Form.Label>
                <span className="text-danger">*</span>

                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  name="fullName"
                  value={values?.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span className="text-danger">
                  {touched?.fullName && errors?.fullName}
                </span>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-4">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={values?.email}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col lg={12}>
              <Form.Group>
                <Form.Label>Your Photo</Form.Label>
                <span className="text-danger">*</span>

                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFieldValue("newPicked", e.target.files[0])
                  }
                />
              </Form.Group>
              {touched.newPicked &&
                errors.newPicked && ( // Add condition to display error message
                  <span className="text-danger">{errors.newPicked}</span>
                )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            className="btn btn-theme2 rounded-pill"
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal show={showOne} onHide={handleCloseOne}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col lg={6}>
              <Form.Group className="mb-4">
                <Form.Label>Gender</Form.Label>
                <span className="text-danger">*</span>
                <CustomSelect
                  name="gender"
                  formikCompatible
                  onChange={additionInfoFormik.handleChange}
                  value={additionInfoFormik.values?.gender ?? ""}
                  placeholder="-- Select gender --"
                  aria-label="Gender"
                  options={[
                    { value: "", label: "-- Select gender --" },
                    { value: constant.MALE, label: "Male" },
                    { value: constant.FEMALE, label: "Female" },
                    { value: constant.OTHERS, label: "Other" },
                  ]}
                />
                <span className="text-danger">
                  {additionInfoFormik?.touched?.gender &&
                    additionInfoFormik?.errors?.gender}
                </span>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group className="mb-4">
                <Form.Label>Age</Form.Label>
                <span className="text-danger">*</span>
                <Form.Control
                  type="text"
                  placeholder="age"
                  value={additionInfoFormik.values?.age}
                  name="age"
                  onChange={additionInfoFormik.handleChange}
                  onBlur={additionInfoFormik.handleBlur}
                />
                <span className="text-danger">
                  {additionInfoFormik?.touched?.age &&
                    additionInfoFormik?.errors?.age}
                </span>
              </Form.Group>
            </Col>
            <Col lg={12}>
              <Form.Group className="mb-4">
                <Form.Label>Occupation</Form.Label>
                <span className="text-danger">*</span>
                <Form.Control
                  type="text"
                  placeholder="Enter your occupation"
                  value={additionInfoFormik?.values?.occupation}
                  name="occupation"
                  onChange={additionInfoFormik.handleChange}
                  onBlur={additionInfoFormik.handleBlur}
                />
                <span className="text-danger">
                  {additionInfoFormik?.touched?.occupation &&
                    additionInfoFormik?.errors?.occupation}
                </span>
              </Form.Group>
            </Col>
            <Col lg={12}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  className="check"
                  name="smoke"
                  value={additionInfoFormik?.values?.other_Field?.smoke}
                  checked={
                    additionInfoFormik?.values?.other_Field?.smoke === true
                  }
                  onChange={(e) => {
                    handleOther(e);
                  }}
                />
                <label for="1">Do you smoke at Home?</label>
              </div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  className="check"
                  name="pet"
                  value={additionInfoFormik?.values?.other_Field?.pet}
                  checked={
                    additionInfoFormik?.values?.other_Field?.pet === true
                  }
                  onChange={(e) => {
                    handleOther(e);
                  }}
                />
                <label for="1">Do you have a pet?</label>
              </div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  className="check"
                  name="room"
                  value={additionInfoFormik?.values?.other_Field?.room}
                  checked={
                    additionInfoFormik?.values?.other_Field?.room === true
                  }
                  onChange={(e) => {
                    handleOther(e);
                  }}
                />
                <label for="1">Who will live in the room?</label>
              </div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  className="check"
                  name="minimum_stay"
                  value={additionInfoFormik?.values?.other_Field?.minimum_stay}
                  checked={
                    additionInfoFormik?.values?.other_Field?.minimum_stay ===
                    true
                  }
                  onChange={(e) => {
                    handleOther(e);
                  }}
                />
                <label for="1">Minimum Stay?</label>
              </div>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  className="check"
                  name="social_media"
                  value={additionInfoFormik?.values?.other_Field?.social_media}
                  checked={
                    additionInfoFormik?.values?.other_Field?.social_media ===
                    true
                  }
                  onChange={(e) => {
                    handleOther(e);
                  }}
                />
                <label for="1">Social Media?</label>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            className="btn btn-theme2 rounded-pill"
            onClick={additionInfoFormik.handleSubmit}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Profile;
