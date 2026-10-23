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
import React, { useState } from "react";
import {
  Badge,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import useSlider from "../../../hooks/useSlider";
import {
  adminDeleteProperty,
  getPropertyList,
} from "../../../services/AdminServices";
import { checkAdminState } from "../../../utils/CheckAdminState";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { restrictAlpha } from "../../../utils/Functions";
import Swal from "sweetalert2";
import Loader from "../../../Loader/Loader";
import { importCsv } from "../../../services/Services";

const PropertyList = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [id, setId] = useState();
  const [isMutationPending, setIsMutationPending] = useState(false);

  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_TEN,
  });
  const { data: propertyList, isFetching } = useQuery({
    queryKey: [
      "property-List",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await getPropertyList(query);
      const { _meta } = resp?.data ?? {};
      setPagination((prevPagination) => ({
        ...prevPagination,
        totalCount: _meta?.totalCount,
        pageNo: _meta?.currentPage ?? prevPagination.pageNo,
        pageLimit: _meta?.perPage ?? prevPagination.pageLimit,
      }));
      return resp?.data?.data;
    },
  });

  const [showCsv, setShowCsv] = useState(false);
  const handleCsvClose = () => {
    setShowCsv(false);
  };
  const handleCsvShow = (idData) => {
    setId(idData);
    setShowCsv(true);
  };

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    resetForm,
    touched,
    errors,
  } = useFormik({
    initialValues: {
      csvPrice: "",
    },
    validationSchema: yup.object().shape({
      csvPrice: yup.string().required().label("Csv price").trim(),
    }),
    onSubmit: async () => {
      let payload = new FormData();
      if (id) {
        payload.append("id", id ?? "");
      }
      payload.append("csvPrice", values?.csvPrice ?? "");
      mutation.mutate(payload);
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) => (id ? agentUpdateProperty(payload) : ""),
    onSuccess: (resp) => {
      handleCsvClose();
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["property-List"] });
      resetForm();
    },
  });

  const csvMutation = useMutation({
    mutationFn: (body) => {
      setIsMutationPending(true);
      return importCsv(body);
    },
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["property-List"] });
      setIsMutationPending(false);
    },
    onError: () => {
      setIsMutationPending(false);
    },
  });

  const fileValidator = (data) => {
    const fileExtension = data.type.split("/")[1];
    const validExtensions = ["csv"];
    if (!validExtensions.includes(fileExtension)) {
      toastAlert("error", "Please select csv format");
      return false;
    }
    return true;
  };

  const handleCsv = async (e) => {
    let file = e.target.files[0];
    if (!fileValidator(file)) {
      return false;
    } else {
      Swal.fire({
        title: "Are you sure you want to upload file?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#004aad",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
          let formData = new FormData();
          formData.append("csvFile", file);
          csvMutation.mutate(formData);
        }
      });
    }
  };

  const { mutate } = useMutation({
    mutationFn: (payload) => adminDeleteProperty(payload),
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["property-List"] });
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this property!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#004aad",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        mutate(id);
      }
    });
  };

  const StatusHandler = (state) => {
    if (state == constant.ACTIVE) {
      return <Badge bg="success">Publish</Badge>;
    } else if (state == constant.INACTIVE) {
      return <Badge bg="warning">UnPublish</Badge>;
    } else if (state == constant.DELETE) {
      return <Badge bg="danger">Deleted</Badge>;
    }
  };
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
              / Property
            </h2>
            <div className="admin-toolbar__actions">
              <a className="theme-btn btn-md" href="/sample.csv" download>
                Download Sample File
              </a>
              <label htmlFor="csvUpload" className="theme-btn btn-md mb-0">
                Import Csv
                <input
                  type="file"
                  hidden
                  accept="text/csv"
                  id="csvUpload"
                  onChange={handleCsv}
                  onClick={(e) => (e.target.value = null)}
                />
              </label>
            </div>
          </div>

          <section className="inner-wrap">
            <Container fluid className="px-0">
              <div className="custom-card">
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th>Sn.</th>
                      <th>Type of flat</th>
                      <th>Elevator</th>
                      <th>Condition</th>
                      <th>Room</th>
                      <th>Floor</th>
                      <th>({constant.EURO})Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyList?.length > 0 ? (
                      propertyList?.map((data, index) => {
                        const serialNumber =
                          index +
                          1 +
                          (pagination.pageNo - 1) * pagination.pageLimit;
                        return (
                          <tr key={index}>
                            <th scope="row">{serialNumber}</th>
                            <td>
                              {/* {data?.type_of_real_estate
                                ?.toLowerCase()
                                .trim() ===
                                constant.HOUSE_DETACHED?.toLowerCase() &&
                                "Flat / Apartment"}
                              {data?.type_of_real_estate?.toLowerCase() ===
                                constant.HOUSE_SEMI_DETACHED?.toLowerCase() &&
                                "Penthouse"}
                              {data?.type_of_real_estate?.toLowerCase() ===
                                constant.HOUSE_TERRACED?.toLowerCase() &&
                                "Duplex"}
                              {
                                constant.HOUSE_ANDER.toLowerCase().includes(data.type_of_real_estate.toLowerCase()) &&
                                "Studio apartment/loft"}
                              {data?.type_of_real_estate?.toLowerCase() ===
                                constant.HOUSE_SHOP?.toLowerCase() && "Shop"} */}
                              {data?.type_of_real_estate}
                            </td>
                            <td>
                              {data?.elevator?.toLowerCase() ===
                              constant.LIFT_YES?.toLowerCase()
                                ? "Yes"
                                : "No"}
                            </td>

                            <td>
                              {data?.condition?.map((data) => {
                                return data;
                              })}
                            </td>

                            <td>{data?.rooms}</td>
                            <td>{data?.floor}</td>
                            <td>
                              {constant.EURO}
                              {Number(data?.price)?.toLocaleString()}
                            </td>
                            <td>{StatusHandler(data?.state)}</td>
                            <td>
                              <div className="action-btn">
                                <button
                                  title="View"
                                  onClick={() =>
                                    navigate(
                                      `/admin/view-property/${data?._id}`
                                    )
                                  }
                                  className="btn-small style-one"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="btn-small style-six"
                                  title="Update csv price"
                                  onClick={() => {
                                    handleCsvShow(data?._id);
                                  }}
                                >
                                  <FaPencilAlt />
                                </button>
                                <button
                                  title="Delete"
                                  disabled={data?.stateId === constant.DELETE}
                                  className="btn btn-danger btn-small"
                                  onClick={() => handleDelete(data?._id)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          Data Not Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {Math.ceil(pagination.totalCount / constant.PER_PAGE_TEN) >
                  1 && (
                  <div>
                    <ReactPaginate
                      containerClassName={
                        "pagination position-relative mt-2 pt-3"
                      }
                      previousLinkClassName={"pagination__link"}
                      nextLinkClassName={"pagination__link"}
                      disabledClassName={"pagination__link--disabled"}
                      activeClassName={"pagination__link--active"}
                      previousLabel={"Prev"}
                      nextLabel={"Next"}
                      onPageChange={(props) => {
                        setPagination({
                          ...pagination,
                          pageNo: props.selected + 1,
                        });
                      }}
                      pageCount={Math.ceil(
                        pagination.totalCount / constant.PER_PAGE_TEN
                      )}
                    />
                  </div>
                )}
              </div>
            </Container>
          </section>
        </div>
        <AdminFooter />
      </div>

      <Modal
        show={showCsv}
        onHide={() => {
          handleCsvClose();
          resetForm();
          setId("");
        }}
      >
        <Modal.Body>
          <Modal.Header closeButton className="p-0 border-0">
            <h2 className="text-center fw-600 mb-0 w-100">
              Add csv price
              <br />
              <svg
                width="159"
                height="2"
                viewBox="0 0 159 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L158 0.999986"
                  stroke="#004aad"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </h2>
          </Modal.Header>
          <Row>
            <Col md={11} className="mx-auto">
              <Form id="loginForm">
                <Row>
                  <Col md={12}>
                    <div className="form-group ">
                      <Form.Label className="fw-bolder">
                        ({constant.EURO})Csv Price
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control border-2 rounded-pill px-4"
                        name="csvPrice"
                        value={values?.csvPrice}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyPress={restrictAlpha}
                        placeholder="Enter a csv price"
                      />
                      <p className="text-danger">
                        {touched?.csvPrice && errors?.csvPrice}
                      </p>
                    </div>
                  </Col>
                </Row>
                <div className="text-center">
                  <button
                    className="btn btn-theme2 px-5 mt-3"
                    onClick={handleSubmit}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              </Form>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
      {isFetching && csvMutation?.isPending && <Loader />}
      {isFetching && <Loader />}
      {isMutationPending && <Loader />}
    </>
  );
};

export default PropertyList;
