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
import { adminCmsView, adminStatusCms } from "../../../services/AdminServices";
import { checkAdminState } from "../../../utils/CheckAdminState";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const ViewCms = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = useParams();
  const { data: viewCms } = useQuery({
    queryKey: ["viewCms", { id }],
    queryFn: async () => {
      const res = await adminCmsView(id);
      return res.data?.data;
    },
  });

  const pageType = (value) => {
    if (value == constant.CMS_TERMS) {
      return "Terms & Conditions";
    } else if (value == constant.CMS_PRIVACY) {
      return "Privacy Policy";
    } else if (value == constant.CMS_ABOUT) {
      return "About us";
    } else if (value == constant.CMS_COOKIES_POLICY) {
      return "Cookies Policy";
    }
  };

  const editMutate = useMutation({
    mutationFn: (payload) =>
      adminStatusCms(id, {
        stateId: payload?.stateId,
      }),
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["viewCms"] });
    },
  });
  return (
    <div className="mainbox">
      <Sidebar />
      <div className={isSlider ? "body-content close" : "body-content open"}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mainhead mb-0">
            <Link to="/admin/dashboard" className="bread_color">
              Home
            </Link> / Cms Details
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
                {viewCms?.typeId === constant.CMS_ABOUT ? (
                  <>
                    <Col xl={4} className="mx-auto">
                      <div className="admin-profile">
                        <img
                          src={
                            viewCms?.image
                              ? mediaUrl(viewCms?.image)
                              : "/static_image.jpg"
                          }
                          alt="Profile"
                        />
                      </div>
                    </Col>
                  </>
                ) : (
                  ""
                )}
                <Col xl={12}>
                  <Table responsive bordered>
                    <tbody>
                      <tr>
                        <th>Title</th>
                        <td>{viewCms?.title}</td>
                      </tr>
                      <tr>
                        <th>Type</th>
                        <td>{pageType(viewCms?.typeId)}</td>
                      </tr>
                      <tr>
                        <th>Description</th>
                        <td
                          dangerouslySetInnerHTML={{
                            __html: viewCms?.description,
                          }}
                        ></td>
                      </tr>
                      <tr>
                        <th>Created On </th>
                        <td>{moment(viewCms?.createdAt).format("LLL")}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>{checkAdminState(viewCms?.stateId)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                {viewCms?.stateId === constant.INACTIVE ? (
                  <div className="text-end mt-4 me-3">
                    <button
                      className="theme-btn btn-md mb-2"
                      type="submit"
                      onClick={() => {
                        editMutate.mutate({
                          stateId: constant.ACTIVE,
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
                          stateId: constant.INACTIVE,
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
  );
};

export default ViewCms;
