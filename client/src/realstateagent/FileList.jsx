/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta

All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaDownload, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import {
  customerFileDelete,
  customerFileList,
  customerOrderDownload,
} from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";

const FileList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState("");

  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_TEN,
  });

  const { data: fileList, isFetching } = useQuery({
    queryKey: [
      "file-list",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await customerFileList(query);
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

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => customerFileDelete(payload),
    onSuccess: () => {
      toastAlert("success", t("FILE_DELETE_TOAST"));
      queryClient.invalidateQueries({ queryKey: ["file-list"] });
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: t("ARE_YOU_SURE"),
      text: t("YOU_WANT_TO_DELETE_FILE"),
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

  const handleDownload = async (orderMongoId) => {
    if (!orderMongoId) return;
    try {
      setDownloadingId(orderMongoId);
      const resp = await customerOrderDownload(orderMongoId);
      const filePath = resp?.data?.data;
      if (resp?.status === 200 && filePath) {
        const url =
          String(filePath).startsWith("/") || String(filePath).startsWith("http")
            ? filePath
            : `/${filePath}`;
        window.location.assign(url);
        toastAlert("success", t("FILE_DOWNLOAD_TOAST"));
      } else {
        toastAlert("error", resp?.data?.message || "Download failed");
      }
    } catch (e) {
      toastAlert("error", e?.response?.data?.message || "Download failed");
    } finally {
      setDownloadingId("");
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
                <div className="emp-das-hd mb-2">
                  <h4 className="emp-dash-title">
                    {t("FILE_LIST")}
                    <br />
                    <svg
                      width="119"
                      height="2"
                      viewBox="0 0 119 2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M1 1H118"
                        stroke="#004AAD"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </h4>
                  <p className="emp-dash-sub">
                    Purchased market data packs — download your Excel files anytime.
                  </p>
                </div>
                <div className="emp-dash-body mb-3">
                  <Table className="table buyer-data-table buyer-file-table w-100" responsive>
                    <thead>
                      <tr>
                        <th>{t("ORDER_ID")}</th>
                        <th>{t("PURCHASE_DATE")}</th>
                        <th>
                          ({constant.EURO}){t("CSV_PRICE")}
                        </th>
                        <th>{t("ACTION")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileList?.length > 0 ? (
                        fileList.map((data) => (
                          <tr key={data?._id}>
                            <td>
                              <strong>#{data?.orderId}</strong>
                            </td>
                            <td>{moment(data?.createdAt).format("LLL")}</td>
                            <td>
                              {constant.EURO}
                              {data?.total}
                            </td>
                            <td>
                              <div className="buyer-actions">
                                <Button
                                  variant="link"
                                  title={t("DOWNLOAD_CSV_FILE") || "Download"}
                                  className="btn-icon-action btn-icon-view"
                                  disabled={downloadingId === data?._id}
                                  onClick={() => handleDownload(data?._id)}
                                >
                                  <FaDownload />
                                </Button>
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            <DataNotFound />
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
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
      {isFetching || isPending || downloadingId ? <Loader /> : ""}
    </>
  );
};

export default FileList;
