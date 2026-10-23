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
import moment from "moment";
import React, { useState } from "react";
import { Col, Container, Form, Row, Table } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as yup from "yup";
import CustomSelect from "../../../components/CustomSelect";
import { useDebounceEffect } from "../../../hooks/UseDebounceEffect";
import useSlider from "../../../hooks/useSlider";
import {
  adminAddCatgeory,
  adminCategoryList,
  adminDeleteCatgeory,
  adminUpdateCategory,
} from "../../../services/AdminServices";
import { checkAdminState } from "../../../utils/CheckAdminState";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";

const PropertyType = () => {
  const isSlider = useSlider();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    search: "",
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_FIVE,
    stateId: "",
  });
  const debouncedSearch = useDebounceEffect(pagination?.search.trim(), 1000);

  const { data: categoryList } = useQuery({
    queryKey: [
      "category-List",
      {
        search: debouncedSearch,
        page: pagination.pageNo,
        limit: pagination.pageLimit,
        stateId: pagination.stateId,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await adminCategoryList(query);
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

  const { mutate } = useMutation({
    mutationFn: (payload) => adminDeleteCatgeory(payload),
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["category-List"] });
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this property type!",
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

  const handleSearchChange = (e) => {
    setPagination({
      ...pagination,
      search: e.target.value,
      pageNo: 1,
    });
  };
  const handleStateFilterChange = (e) => {
    setPagination({
      ...pagination,
      stateId: e.target.value,
      pageNo: 1, // Reset page number to 1 when state filter changes
    });
  };

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (values?.id) {
        return adminUpdateCategory(values?.id, payload);
      }
      return adminAddCatgeory(payload);
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ["category-List"] });
      toastAlert("success", resp?.data?.message);
      resetForm();
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
  } = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: yup.object().shape({
      name: yup.string().required().label("Title").trim(),
    }),
    onSubmit: async (values) => {
      let payload = new FormData();
      if (values.id) {
        payload.append("id", values.id ?? "");
      }
      payload.append("name", values.name.replace(/\s+/g, " ").trim());
      mutation.mutate(payload);
    },
  });

  return (
    <>
      <div className="mainbox">
        <Sidebar />
        <div className={isSlider ? "body-content close" : "body-content open"}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="mainhead mb-0">
              <Link to="/admin/dashboard" className="bread_color">
                Home
              </Link> / Property Type
            </h2>
            <div className=" d-flex align-items-center gap-3 my-2 mx-1">
              <input
                type="text"
                placeholder="Search"
                value={pagination.search}
                onChange={handleSearchChange}
                className="form-control admin-toolbar__search"
              />

              <CustomSelect
                value={pagination.stateId ?? ""}
                onChange={(val) =>
                  handleStateFilterChange({ target: { value: val } })
                }
                placeholder="All Status"
                aria-label="Status"
                options={[
                  { value: "", label: "All Status" },
                  { value: constant.ACTIVE, label: "Active" },
                  { value: constant.INACTIVE, label: "In-Active" },
                ]}
              />
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
                          name="name"
                          value={values?.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <p className="text-danger">
                          {touched?.name && errors?.name}
                        </p>
                      </Form.Group>
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

          <section className="inner-wrap">
            <Container fluid className="px-0">
              <div className="custom-card">
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th>Sn.</th>
                      <th>Title</th>
                      <th>Created On</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryList?.length > 0 ? (
                      categoryList?.map((data, index) => {
                        const serialNumber =
                          index +
                          1 +
                          (pagination.pageNo - 1) * pagination.pageLimit;
                        return (
                          <tr key={index}>
                            <th scope="row">{serialNumber}</th>
                            <td>{data?.name}</td>
                            <td>{moment(data?.createdAt).format("LLL")}</td>
                            <td>{checkAdminState(data?.stateId)}</td>
                            <td>
                              <div className="action-btn">
                                <button
                                  title="View"
                                  onClick={() =>
                                    navigate(
                                      `/admin/view-property-type/${data?._id}`
                                    )
                                  }
                                  className="btn-small style-one"
                                >
                                  <FaEye />
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
                {Math.ceil(pagination.totalCount / constant.PER_PAGE_FIVE) >
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
                        pagination.totalCount / constant.PER_PAGE_FIVE
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
    </>
  );
};

export default PropertyType;
