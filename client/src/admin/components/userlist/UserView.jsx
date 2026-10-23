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
import React from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import useSlider from "../../../hooks/useSlider";
import {
  adminUserUpdate,
  adminUserView,
} from "../../../services/AdminServices";
import { checkAdminState } from "../../../utils/CheckAdminState";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const UserView = () => {
  const isSlider = useSlider();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: userView } = useQuery({
    queryKey: ["userView", { id }],
    queryFn: async () => {
      const res = await adminUserView(id);
      return res.data?.data;
    },
  });

  const editMutate = useMutation({
    mutationFn: (payload) =>
      adminUserUpdate(id, {
        state: payload?.state,
      }),
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["userView"] });
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
              </Link>{" "}
              / User Details
            </h2>
            <div className="text-end mx-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="theme-btn btn-md mb-2"
              >
                Back
              </button>
            </div>
          </div>

          <section className="inner-wrap">
            <Container fluid className="px-0">
              <div className="custom-card">
                <Row>
                  <Col xl={4} className="mx-auto">
                    <div className="admin-profile">
                      <img
                        src={
                          userView?.profileImgId
                            ? mediaUrl(userView?.profileImgId)
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
                          <th>First name</th>
                          <td>{userView?.firstName}</td>
                        </tr>
                        <tr>
                          <th>Last name</th>
                          <td>{userView?.lastName}</td>
                        </tr>
                        <tr>
                          <th>Email address</th>
                          <td>{userView?.email}</td>
                        </tr>

                        <tr>
                          <th>Terms and condition Accepted</th>
                          <td>
                            {userView?.terms == 1 ? "Accepted" : "Not accepted"}
                          </td>
                        </tr>

                        <tr>
                          <th>Email Marketing Check</th>
                          <td>
                            {userView?.emailChecked == 1
                              ? "Email Marketing Check"
                              : "Not checked"}
                          </td>
                        </tr>
                        <tr>
                          <th>Created On </th>
                          <td>{moment(userView?.createdAt).format("LLL")}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>{checkAdminState(userView?.state)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  {userView?.state === constant.INACTIVE ? (
                    <div className="text-end mt-4 me-3">
                      <button
                        className="theme-btn btn-md mb-2"
                        type="submit"
                        onClick={() => {
                          editMutate.mutate({
                            state: constant.ACTIVE,
                          });
                        }}
                      >
                        Active
                      </button>
                    </div>
                  ) : (
                    <div className="text-end mt-4 me-3">
                      <button
                        className="theme-btn btn-md mb-2"
                        type="submit"
                        onClick={() => {
                          editMutate.mutate({
                            state: constant.INACTIVE,
                          });
                        }}
                      >
                        In-Active
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </section>
        </div>
        <AdminFooter />
      </div>
    </>
  );
};

export default UserView;
