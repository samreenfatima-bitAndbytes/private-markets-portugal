/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Badge, Button, Col, Container, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaUserAltSlash,
  FaUserCheck,
} from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import useDetails from "../hooks/useDetails";
import {
  adminStatusProperty,
  agentPropertyDelete,
  customerPropertyList,
} from "../services/Services";
import { truncate } from "../utils/Functions";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";

const PropertyList = () => {
  const { t } = useTranslation();
  const details = useDetails();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buyers browse the marketplace; agents manage their own listings here.
  if (details?.roleId === constant.CUSTOMER) {
    return <Navigate to="/customer/property-listing" replace />;
  }

  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_SIX,
  });
  const { data: propertyList, isFetching } = useQuery({
    queryKey: [
      "property-list",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await customerPropertyList(query);
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
    mutationFn: (payload) => agentPropertyDelete(payload),
    onSuccess: () => {
      toastAlert("success", t("PROPERTY_DELETE_TOAST"));
      queryClient.invalidateQueries({ queryKey: ["property-list"] });
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: t("ARE_YOU_SURE"),
      text: t("YOU_WANT_TO_DELETE_PROPERTY"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#004aad",
      cancelButtonColor: "#d33",
      confirmButtonText: t("YOU_DELETE_IT"),
      cancelButtonText: t("CANCEL"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        mutate(id);
      }
    });
  };

  const handelStateChange = (id, state) => {
    let body = {
      state: state,
    };
    stateMutate.mutate({ id, body });
  };

  const stateMutate = useMutation({
    mutationFn: (variable) => {
      return adminStatusProperty(variable?.id, variable?.body);
    },
    onSuccess: (resp) => {
      resp?.data?.data?.state == constant.ACTIVE
        ? toastAlert("success", t("PROPERTY_PUBLISH_SUCCESSFULLY"))
        : toastAlert("success", t("PROPERTY_UNPUBLISH_SUCCESSFULLY"));
      queryClient.invalidateQueries({ queryKey: ["property-list"] });
    },
  });

  const StatusHandler = (state) => {
    if (state == constant.ACTIVE) {
      return <Badge bg="success">{t("PUBLISH")}</Badge>;
    } else if (state == constant.INACTIVE) {
      return <Badge bg="warning">{t("UNPUBLISH")}</Badge>;
    }
  };

  return (
    <>
      <Header />
      <section className="employee-dashbord">
        <Container>
          <Row className="g-4">
            <Col lg={3}>
              <UserSidebar />
            </Col>
            <Col lg={9} className="min-w-0">
              <div className="emp-dash-card sidebox">
                <div className="emp-das-hd d-flex align-items-center justify-content-between mb-3">
                  <h4 className="emp-dash-title">
                    {t("PROPERTY_LIST")}
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
                <div className="emp-dash-body mb-3">
                  <Table className="table buyer-data-table w-100" responsive>
                    <thead>
                      <tr>
                        <th scope="col">{t("SN.")}</th>
                        <th scope="col">{t("PROPERTY_TYPE")}</th>
                        <th scope="col">{t("YEAR_OF_CONSTRUCTION")}</th>
                        <th scope="col">{t("STREET")}</th>
                        <th scope="col">{t("STATUS")}</th>
                        <th scope="col">{t("ACTION")}</th>
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
                              <td scope="row">{serialNumber}</td>
                              <td>
                                {data?.type_of_real_estate ||
                                  data?.categoryId ||
                                  "-"}
                              </td>
                              <td>{data?.year_of_construction ?? "-"}</td>
                              <td title={data?.street || ""}>
                                {data?.street || "-"}
                              </td>
                              <td>{StatusHandler(data?.state)}</td>
                              <td>
                                <div className="buyer-actions">
                                  <Button
                                    variant="link"
                                    title={t("VIEW")}
                                    className="btn-icon-action btn-icon-view"
                                    onClick={() =>
                                      navigate(
                                        `/customer/view-property/${data?._id}`
                                      )
                                    }
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button
                                    variant="link"
                                    className="btn-icon-action btn-icon-edit"
                                    title={t("EDIT")}
                                    onClick={() =>
                                      navigate(
                                        `/customer/edit-property/${data?._id}`
                                      )
                                    }
                                  >
                                    <FaEdit />
                                  </Button>
                                  {data?.state === constant.ACTIVE ? (
                                    <Button
                                      variant="link"
                                      title={t("PUBLISH")}
                                      className="btn-icon-action btn-icon-success"
                                      onClick={() =>
                                        handelStateChange(
                                          data?._id,
                                          constant.INACTIVE
                                        )
                                      }
                                    >
                                      <FaUserCheck />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="link"
                                      title={t("UNPUBLISH")}
                                      className="btn-icon-action btn-icon-warn"
                                      onClick={() =>
                                        handelStateChange(
                                          data?._id,
                                          constant.ACTIVE
                                        )
                                      }
                                    >
                                      <FaUserAltSlash />
                                    </Button>
                                  )}
                                  <Button
                                    variant="link"
                                    title={t("DELETE")}
                                    className="btn-icon-action btn-icon-delete"
                                    onClick={() => handleDelete(data?._id)}
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
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
                  {Math.ceil(pagination.totalCount / constant.PER_PAGE_SIX) >
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
                          pagination.totalCount / constant.PER_PAGE_SIX
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
      {isFetching && <Loader />}
    </>
  );
};

export default PropertyList;
