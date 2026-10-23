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
  adminStatusProduct,
  adminViewProduct,
} from "../../../services/AdminServices";
import { checkAdminState } from "../../../utils/CheckAdminState";
import { toastAlert } from "../../../utils/SweetAlert";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const ViewProduct = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = useParams();
  const { data: viewProduct } = useQuery({
    queryKey: ["viewProduct", { id }],
    queryFn: async () => {
      const res = await adminViewProduct(id);
      return res.data?.data;
    },
  });

  const editMutate = useMutation({
    mutationFn: (payload) =>
      adminStatusProduct(id, {
        stateId: payload?.stateId,
      }),
    onSuccess: (resp) => {
      toastAlert("success", resp?.data?.message);
      queryClient.invalidateQueries({ queryKey: ["viewProduct"] });
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
            </Link> / Product Details
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
                <Col xl={12}>
                  <Table responsive bordered>
                    <tbody>
                      <tr>
                        <th>Product name</th>
                        <td>{viewProduct?.productName}</td>
                      </tr>

                      <tr>
                        <th>({constant.EURO})Price</th>
                        <td> {Number(viewProduct?.price)?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <th>Created On </th>
                        <td>{moment(viewProduct?.createdAt).format("LLL")}</td>
                      </tr>
                      <tr>
                        <th>Status</th>
                        <td>{checkAdminState(viewProduct?.stateId)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>

                <Col lg={12}>
                  <Table responsive bordered>
                    <tbody>
                      <tr>
                        <th>Product file</th>
                        <td>
                          <div className="imag-video d-flex align-items-center">
                            {viewProduct?.productFile == "" ? (
                              " "
                            ) : (
                              <img
                                className="mx-2"
                                src="/xlsl.png"
                                width="200px"
                                height="150px"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>Product image</th>
                        <td>
                          <div className="imag-video d-flex align-items-center">
                            {viewProduct?.productImg?.map((file, index) => {
                              return (
                                <img
                                  className="mx-2"
                                  src={
                                    file
                                      ? mediaUrl(file)
                                      : "/static_image.jpg"
                                  }
                                  width="200px"
                                  height="150px"
                                />
                              );
                             
                            })}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                {viewProduct?.stateId === constant.INACTIVE ? (
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

export default ViewProduct;
