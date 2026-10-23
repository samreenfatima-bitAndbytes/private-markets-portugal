/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React, { useState } from "react";
import { Container, Table } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { Link, useNavigate } from "react-router-dom";
import { useDebounceEffect } from "../../../hooks/UseDebounceEffect";
import useSlider from "../../../hooks/useSlider";
import { adminUserList } from "../../../services/AdminServices";
import { checkAdminState } from "../../../utils/CheckAdminState";
import CustomSelect from "../../../components/CustomSelect";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const UserList = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_TEN,
    roleId: constant.USER,
    state: "",
    search: "",
  });
  const debouncedSearch = useDebounceEffect(pagination?.search.trim(), 1000);

  const { data: userList } = useQuery({
    queryKey: [
      "userList",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
        roleId: pagination.roleId,
        state: pagination.state,
        search: debouncedSearch,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await adminUserList(query);
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

  const handleSearchChange = (e) => {
    setPagination({
      ...pagination,
      search: e.target.value,
      pageNo: 1,
    });
  };
  const handleStateFilterChange = (state) => {
    setPagination({
      ...pagination,
      state,
      pageNo: 1,
    });
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
              / Users Management
            </h2>
            <div className="admin-toolbar__actions">
              <input
                type="text"
                placeholder="Search With Email"
                value={pagination.search}
                onChange={handleSearchChange}
                className="form-control admin-toolbar__search"
              />
              <div className="admin-toolbar__filter">
                <CustomSelect
                  value={String(pagination.state ?? "")}
                  onChange={handleStateFilterChange}
                  placeholder="All Status"
                  aria-label="Filter by status"
                  options={[
                    { value: "", label: "All Status" },
                    { value: String(constant.ACTIVE), label: "Active" },
                    { value: String(constant.INACTIVE), label: "In-Active" },
                  ]}
                />
              </div>
            </div>
          </div>

          <section className="inner-wrap">
            <Container fluid className="px-0">
              <div className="custom-card">
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th>Sn.</th>
                      <th>Profile</th>
                      <th>First name</th>
                      <th>Last name</th>
                      <th>Email address</th>
                      <th>Created On</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList?.length > 0 ? (
                      userList?.map((data, index) => {
                        const serialNumber =
                          index +
                          1 +
                          (pagination.pageNo - 1) * pagination.pageLimit;
                        return (
                          <tr key={index}>
                            <th scope="row">{serialNumber}</th>
                            <td>
                              <div className="table-user d-flex align-items-center">
                                <span className="table-user-icon">
                                  <img
                                    src={
                                      data?.profileImgId
                                        ? mediaUrl(data?.profileImgId)
                                        : "/default.png"
                                    }
                                  />
                                </span>
                              </div>
                            </td>
                            <td>{data?.firstName}</td>
                            <td>{data?.lastName}</td>
                            <td>{data?.email}</td>

                            <td>{moment(data?.createdAt).format("LLL")}</td>
                            <td>{checkAdminState(data?.state)}</td>
                            <td>
                              <div className="action-btn">
                                <button
                                  title="View"
                                  onClick={() =>
                                    navigate(`/admin/view-user/${data?._id}`)
                                  }
                                  className="btn-small style-one"
                                >
                                  <FaEye />
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
export default UserList;
