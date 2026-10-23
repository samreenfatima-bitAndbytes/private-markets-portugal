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
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaPen, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import * as yup from "yup";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import {
  customerSearchDelete,
  customerSearchDisable,
  customerSearchList,
  customerSearchUpdate,
} from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import "./search.scss";

function MySearches() {
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const queryClient = useQueryClient();
  const [id, setId] = useState("");
  const handleShow = (idData) => {
    setId(idData);
    setShow(true);
  };

  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_FIVE,
  });
  const { data: searchList, isFetching } = useQuery({
    queryKey: [
      "search-list",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await customerSearchList(query);
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

  const mutation = useMutation({
    mutationFn: (body) => id && customerSearchUpdate(body),
    onSuccess: () => {
      // Success actions
      toastAlert("success", t("SEARCH_NAME_TOAST"));
      resetForm();
      handleClose();
      queryClient.invalidateQueries({ queryKey: ["search-list"] });
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
      search: "",
    },
    validationSchema: yup.object().shape({
      search: yup.string().required(t("SEARCH_VALIDATION")).trim(),
    }),

    onSubmit: async (values) => {
      let body = {
        id: id,
        search: values?.search,
      };

      mutation.mutate(body);
    },
  });
  const { mutate } = useMutation({
    mutationFn: (payload) => customerSearchDelete(payload),
    onSuccess: () => {
      toastAlert("success", t("SEARCH_DELETE_TOAST"));
      queryClient.invalidateQueries({ queryKey: ["search-list"] });
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: t("SEARCH_CONFIRM"),
      text: t("SEARCH_TEXT"),
      showCancelButton: true,
      confirmButtonColor: "#004aad",
      cancelButtonColor: "#d33",
      cancelButtonText: t("SEARCH_CANCEL"),
      confirmButtonText: t("SEARCH_CONFIRM_BUTTON"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        mutate(id);
      }
    });
  };

  const enableAndDisableMutation = useMutation({
    mutationFn: (body) => customerSearchDisable(body),
    onSuccess: () => {
      toastAlert("success", t("TOGGLE_TOAST"));
      queryClient.invalidateQueries({ queryKey: ["search-list"] });
    },
    onError: (err) => {
      toastAlert(
        "error",
        err?.response?.data?.message || "Could not update alert setting"
      );
    },
  });

  // Master "daily roundup" — on if any saved search has alerts enabled (typeId === 1)
  const anyAlertsOn =
    Array.isArray(searchList) &&
    searchList.some((s) => Number(s?.typeId) === 1);

  const toggleAllAlerts = (enable) => {
    if (!searchList?.length) {
      toastAlert("error", "Save a search first to enable alerts");
      return;
    }
    const targetTypeId = enable ? 1 : 2; // 1 = ENABLE, 2 = DISABLE
    searchList.forEach((s) => {
      if (Number(s?.typeId) === targetTypeId) return;
      enableAndDisableMutation.mutate({ id: s._id, typeId: targetTypeId });
    });
  };

  const toggleOneAlert = (data) => {
    const nextTypeId = Number(data?.typeId) === 1 ? 2 : 1;
    enableAndDisableMutation.mutate({ id: data._id, typeId: nextTypeId });
  };

  return (
    <>
      <Header />
      <section className="employee-dashbord searchsection my-search">
        <Container>
          <Row>
            <Col lg={3}>
              <UserSidebar />
            </Col>
            <Col lg={9} className="min-w-0">
          <h2 className="mainheading mb-4">
            {t("YOUR_SEARCHES")} ({pagination.totalCount || 0})
          </h2>

          <div className="d-flex align-items-start gap-3 mb-3">
            <Form.Check
              type="switch"
              id="daily-roundup-switch"
              className="custom_switch"
              checked={!!anyAlertsOn}
              disabled={!searchList?.length || enableAndDisableMutation.isPending}
              onChange={(e) => toggleAllAlerts(e.target.checked)}
            />
            <div className="min-w-0">
              <h4 className="mb-2 fw-bold">
                {t("DAILY_ROUNDUP_OF_ALL_YOUR_SEARCHES")}
              </h4>
              <p className="fw-normal">{t("SAVE_SEARCH_CONTENT")}</p>
            </div>
          </div>
              <Table responsive>
                <thead>
                  <tr>
                    <th></th>
                    <th>{t("INSTANT_ALERTS")}</th>
                    <th>{t("RENAME")}</th>
                    <th>{t("DELETE")}</th>
                  </tr>
                </thead>
                <tbody>
                  {searchList?.length > 0 ? (
                    searchList?.map((data) => {
                      return (
                          <tr key={data?._id}>
                            <td>
                              <h4>
                                <Link className="item_title">
                                  {data?.search}
                                </Link>
                              </h4>
                              <p className="disc">
                                {data?.propertyType == "" ? (
                                  ""
                                ) : (
                                  <>{data?.propertyType};</>
                                )}
                                {data?.rooms == "" ? (
                                  ""
                                ) : (
                                  <>{data?.rooms} Room;</>
                                )}
                                &nbsp;
                                {data?.baths == "" ? (
                                  ""
                                ) : (
                                  <>{data?.baths} Baths;</>
                                )}
                                &nbsp;
                                {data?.floor == "" ? (
                                  ""
                                ) : (
                                  <>{data?.floor} Floor;</>
                                )}
                                &nbsp;
                                {data?.condition ==
                                  constant.PROPERTY_GOOD_CONDITION &&
                                  "Good condition;"}
                                {data?.condition ==
                                  constant.PROPERTY_NEED_RENOVATING &&
                                  "Needs renovating;"}
                                &nbsp;
                                {data?.other_features_real_estate
                                  ? `${data.other_features_real_estate};`
                                  : ""}
                                &nbsp;
                                {data?.other_features_building
                                  ? `${data.other_features_building};`
                                  : ""}
                                &nbsp;
                                {data?.date == ""
                                  ? ""
                                  : data?.date == constant.FILTER_48_WEEK &&
                                    "48 Weeks" + ";"}
                                {data?.date == ""
                                  ? ""
                                  : data?.date == constant.FILTER_LAST_WEEK &&
                                    "Last Week" + ";"}
                                {data?.date == ""
                                  ? ""
                                  : data?.date == constant.FILTER_LAST_MONTH &&
                                    "Last Month" + ";"}
                                {data?.maxPrice == null ? (
                                  ""
                                ) : (
                                  <>
                                    MaxPrice {constant.EURO}
                                    {Number(data?.maxPrice)?.toLocaleString() +
                                      ";"}
                                  </>
                                )}
                                &nbsp;
                                {data?.minPrice == null ? (
                                  ""
                                ) : (
                                  <>
                                    MinPrice {constant.EURO}
                                    {Number(data?.minPrice)?.toLocaleString() +
                                      ";"}
                                  </>
                                )}
                                &nbsp;
                                {data?.maxSize == null ? (
                                  ""
                                ) : (
                                  <>
                                    Gross max
                                    {data?.maxSize}
                                  </>
                                )}
                                &nbsp;
                                {data?.minSize == null ? (
                                  ""
                                ) : (
                                  <>
                                    Gross min
                                    {data?.minSize}
                                  </>
                                )}
                                &nbsp;
                                {data?.maxNet == null ? (
                                  ""
                                ) : (
                                  <>
                                    Net max
                                    {data?.maxNet}
                                  </>
                                )}
                                &nbsp;
                                {data?.minNet == null ? (
                                  ""
                                ) : (
                                  <>
                                    Net min
                                    {data?.minNet}
                                  </>
                                )}
                              </p>
                            </td>
                            <td>
                              <div className="d-flex align-items-start gap-3">
                                <>
                                  <Form.Check
                                    type="switch"
                                    id={`custom-switch-${data?._id}`}
                                    name={`search-switch-${data?._id}`}
                                    className="custom_switch"
                                    checked={Number(data?.typeId) === 1}
                                    disabled={enableAndDisableMutation.isPending}
                                    onChange={() => toggleOneAlert(data)}
                                  />
                                </>
                                {Number(data?.typeId) === 1 ? (
                                  <div>
                                    <h6 className="mb-0 fw-bold">
                                      {t("INSTANT_ALERTS_ACTIVE")}
                                    </h6>
                                    <p className="fw-normal">
                                      {t("EMAIL_FOR_EACH_NEW_LISTING")}
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <h6 className="mb-0 fw-bold">
                                      {t("ACTIVATE_INSTANT_ALERTS")}
                                    </h6>
                                    <p className="fw-normal">
                                      {t("YOU_WILL_RECEIVE_THE_DAILY_EMAIL")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td>
                              <Button
                                variant="link"
                                className="btn-icon-action btn-icon-edit"
                                title={t("EDIT")}
                                onClick={() => {
                                  handleShow(data?._id);
                                }}
                              >
                                <FaPen />
                              </Button>
                            </td>
                            <td>
                              <Button
                                variant="link"
                                className="btn-icon-action btn-icon-delete"
                                title={t("DELETE")}
                                onClick={() => {
                                  handleDelete(data?._id);
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        <DataNotFound />
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
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />

      {/* Rename Modal */}
      <Modal
        show={show}
        onHide={() => {
          handleClose();
          resetForm();
          setId("");
        }}
        centered
      >
        <Modal.Header className="border-0 p-0" closeButton></Modal.Header>
        <Form>
          <Modal.Body>
            <div className="p-5 pb-0">
              <Form.Group>
                <Form.Label>
                  {t("NAME_SEARCH")}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("ENTER_SEARCH")}
                  name="search"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values?.search}
                />
                <span className="text-danger">
                  {touched?.search && errors?.search}
                </span>
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center pt-0">
            <Button
              className="btn btn-theme2"
              onClick={handleSubmit}
              type="button"
            >
              {t("RENAME")}
            </Button>
            <Button className="btn btn-default" onClick={handleClose}>
              {t("CANCEL")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {isFetching && <Loader />}
    </>
  );
}

export default MySearches;
