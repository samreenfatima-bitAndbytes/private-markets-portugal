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
import { Badge, Container, Table } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CustomSelect from "../../../components/CustomSelect";
import { useDebounceEffect } from "../../../hooks/UseDebounceEffect";
import useSlider from "../../../hooks/useSlider";
import {
  adminEmailAllDelete,
  adminEmailDelete,
  adminEmailList,
} from "../../../services/AdminServices";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";

const MessageQueue = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    state: "",
    search: "",
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_TEN,
    typeId: constant.PAGE_NO_ONE,
  });
  const debouncedSearch = useDebounceEffect(pagination?.search, 1000);

  const { data: messageList } = useQuery({
    queryKey: [
      "messageList",
      {
        state: pagination.state,
        search: debouncedSearch,
        page: pagination.pageNo,
        limit: pagination.pageLimit,
        typeId: pagination.typeId,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await adminEmailList(query);
      const { _meta } = resp?.data ?? {};
      setPagination((prevPagination) => ({
        ...prevPagination,
        totalCount: _meta?.totalCount,
        pageNo: _meta?.currentPage ?? prevPagination.pageNo,
        limit: _meta?.perPage ?? prevPagination.limit,
      }));
      return resp?.data?.data;
    },
  });

  const handleSearchChange = (e) => {
    setPagination({
      ...pagination,
      search: e.target.value,
      page: 1,
    });
  };
  const handleStateFilterChange = (e) => {
    setPagination({
      ...pagination,
      state: e.target.value,
      page: 1, // Reset page number to 1 when state filter changes
    });
  };

  const StatusHandler = (stateId) => {
    if (stateId == constant.EMAIL_SUCCESS) {
      return <Badge bg="success">Success</Badge>;
    } else if (stateId == constant.EMAIL_FAILED) {
      return <Badge bg="danger">Failed</Badge>;
    } else if (stateId == constant.EMAIL_PENDING) {
      return <Badge bg="info">Pending</Badge>;
    } else {
      return "N/A";
    }
  };

  const handleAllDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete all the message queue!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#004aad",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete It!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(); // Call the mutate function to delete all error logs
      }
    });
  };

  const deleteMutation = useMutation({
    mutationFn: () => adminEmailAllDelete(),
    onSuccess: () => {
      // Success actions
      toastAlert("success", "All message queue delete successfully");
      queryClient.invalidateQueries({ queryKey: ["messageList"] });
    },
  });

  const handleSingleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete the message queue!",
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

  const { mutate } = useMutation({
    mutationFn: (payload) => adminEmailDelete(payload),
    onSuccess: () => {
      toastAlert("success", "Message queue delete successfully");
      queryClient.invalidateQueries({ queryKey: ["messageList"] });
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
              </Link> / Message Queue
            </h2>
            <div className=" d-flex align-items-center gap-3 my-2 mx-1">
              <input
                type="text"
                placeholder="Search With To"
                value={pagination.search.trim()}
                onChange={handleSearchChange}
                className="form-control admin-toolbar__search"
              />

              <CustomSelect
                value={pagination.state ?? ""}
                onChange={(val) =>
                  handleStateFilterChange({ target: { value: val } })
                }
                placeholder="All Status"
                aria-label="Status"
                options={[
                  { value: "", label: "All Status" },
                  {
                    value: constant.EMAIL_SUCCESS,
                    label: "Success",
                  },
                  {
                    value: constant.EMAIL_FAILED,
                    label: "Failed",
                  },
                ]}
              />
              <button
                type="button"
                disabled={messageList?.length === 0}
                onClick={() => {
                  handleAllDelete();
                }}
                className="btn btn-danger email_btn w-100"
              >
                Delete All
              </button>
            </div>
          </div>
          <section className="inner-wrap">
            <Container fluid className="px-0">
              <div className="custom-card">
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th>Sn.</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Subject</th>
                      <th>Created On</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messageList?.length > 0 ? (
                      messageList?.map((data, index) => {
                        const serialNumber =
                          index +
                          1 +
                          (pagination.pageNo - 1) * pagination.pageLimit;
                        return (
                          <tr key={index}>
                            <th scope="row">{serialNumber}</th>
                            <td>{data?.from}</td>
                            <td>{data?.to}</td>
                            <td>{data?.subject}</td>
                            <td>{moment(data?.createdAt).format("LLL")}</td>
                            <td>{StatusHandler(data?.stateId)}</td>
                            <td>
                              <div className="action-btn">
                                <button
                                  title="View"
                                  onClick={() =>
                                    navigate(`/admin/view-message/${data?._id}`)
                                  }
                                  className="btn-small style-one"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  title="Delete"
                                  className="btn btn-danger btn-small"
                                  onClick={() => {
                                    handleSingleDelete(data?._id);
                                  }}
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
    </>
  );
};

export default MessageQueue;
