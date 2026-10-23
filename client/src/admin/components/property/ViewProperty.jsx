/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/

import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React from "react";
import {
  Badge,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Table,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import useDetails from "../../../hooks/useDetails";
import useSlider from "../../../hooks/useSlider";
import { adminPropertyView } from "../../../services/AdminServices";
import { constant } from "../../../utils/constant";
import Sidebar from "../../sidebar/Sidebar";
import AdminFooter from "../AdminFooter";
import { mediaUrl } from "../../../utils/mediaUrl";

const ViewProperty = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const data = useDetails();

  const { id } = useParams();
  const { data: propertyView } = useQuery({
    queryKey: ["propertyView", { id }],
    queryFn: async () => {
      const res = await adminPropertyView(id);
      return res.data?.data;
    },
  });

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
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="mainhead mb-0">
              <Link to="/admin/dashboard" className="bread_color">
                Home
              </Link> / Property Details
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
          {propertyView?.categoryId == "Business" ? (
            <>
              <section className="inner-wrap">
                <Container fluid className="px-0">
                  <div className="custom-card">
                    <Row>
                      <Col xl={12}>
                        <Table responsive bordered>
                          <tbody>
                            <tr>
                              <th>Property type</th>
                              <td>{propertyView?.categoryId}</td>
                            </tr>
                            <tr>
                              <th>Description</th>
                              <td>{propertyView?.description}</td>
                            </tr>
                            <tr>
                              <th>Status</th>
                              <td>{StatusHandler(propertyView?.state)}</td>
                            </tr>

                            <tr>
                              <th>Created On </th>
                              <td>
                                {moment(propertyView?.createdAt).format("LLL")}
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </div>
                </Container>
              </section>
            </>
          ) : (
            <>
              <section className="inner-wrap">
                <Container fluid className="px-0">
                  <Row>
                    <Col lg={12}>
                      <Card className="mb-0">
                        <CardBody>
                          <Row>
                            <Col lg={12}>
                              <Table responsive bordered>
                                <tbody>
                                  <tr>
                                    <th>Property type</th>
                                    {/* <td>{propertyView?.categoryId}</td> */}
                                    <td>{propertyView?.type_of_real_estate}</td>
                                    <th>Construction year</th>
                                    <td>
                                      {propertyView?.year_of_construction}
                                    </td>
                                  </tr>

                                  <tr>
                                    <th>Floor</th>
                                    <td>{propertyView?.floor}</td>
                                    <th>Room</th>
                                    <td>{propertyView?.rooms}</td>
                                  </tr>
                                  <tr>
                                    <th>Bathroom</th>
                                    <td>{propertyView?.baths}</td>
                                    <th>Elevator</th>
                                    <td>
                                      {propertyView?.elevator?.toLowerCase() ==
                                        constant.LIFT_YES?.toLowerCase()
                                        ? "Yes"
                                        : "No"}
                                    </td>
                                  </tr>

                                  <tr>
                                    <th>Type of flat</th>
                                    <td>
                                      {propertyView?.type_of_real_estate?.toLowerCase() ===
                                        constant.HOUSE_DETACHED?.toLowerCase() &&
                                        "Flat/Apartment "}
                                      {propertyView?.type_of_real_estate?.toLowerCase() ===
                                        constant.HOUSE_SEMI_DETACHED?.toLowerCase() &&
                                        "Penthouse"}
                                      {propertyView?.type_of_real_estate?.toLowerCase() ===
                                        constant.HOUSE_TERRACED?.toLowerCase() &&
                                        "Duplex"}
                                      {propertyView?.type_of_real_estate?.toLowerCase() ===
                                        constant.HOUSE_ANDER?.toLowerCase() &&
                                        " Studio apartment/loft"}
                                    </td>
                                    <th>Condition</th>
                                    <td>
                                      {propertyView?.condition?.map((data) => {
                                        return data;
                                      })}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Gross area(m2) </th>
                                    <td>{propertyView?.gross_area}</td>
                                    <th>Net area(m2)</th>
                                    <td>{propertyView?.net_area}</td>
                                  </tr>
                                  <tr>
                                    <th>Link</th>
                                    <td>{propertyView?.link}</td>
                                    <th>Reference</th>
                                    <td>{propertyView?.reference}</td>
                                  </tr>
                                  <tr>
                                    <th>Orientation</th>
                                    <td>
                                      {(() => {
                                        const position = propertyView?.position?.toLowerCase();
                                        if (position === constant.NORTH?.toLowerCase() || position === "norte") {
                                          return "North";
                                        } else if (position === constant.SOUTH?.toLowerCase() || position ==="sul") {
                                          return "South";
                                        } else if (position === constant.EAST?.toLowerCase() || position === "leste") {
                                          return "East";
                                        } else if (position === constant.WEST?.toLowerCase() || position === "oeste") {
                                          return "West";
                                        } else {
                                          return position;
                                        }
                                      })()}
                                    </td>
                                    <th>({constant.EURO})Price</th>
                                    <td>
                                      {constant.EURO}
                                      {Number(
                                        propertyView?.price
                                      )?.toLocaleString()}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Price estimation</th>
                                    <td>
                                      {propertyView?.priceEstimation}
                                    </td>
                                    <th>Expected rental yield</th>
                                    <td>
                                      {propertyView?.expectedRentalYield}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Days to sale</th>
                                    <td>
                                      {propertyView?.daysToSale}
                                    </td>
                                    <th>Price delta</th>
                                    <td>
                                      {propertyView?.priceDelta}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>({constant.EURO})Csv Price</th>
                                    <td>
                                      {constant.EURO}
                                      {Number(
                                        propertyView?.csvPrice
                                      )?.toLocaleString()}
                                    </td>
                                    <th>Created On </th>
                                    <td>
                                      {moment(propertyView?.createdAt).format(
                                        "LLL"
                                      )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <th>Status</th>
                                    <td>
                                      <td>
                                        {StatusHandler(propertyView?.state)}
                                      </td>
                                    </td>
                                    <th>Description</th>
                                    <td
                                      dangerouslySetInnerHTML={{
                                        __html: propertyView?.description,
                                      }}
                                    />
                                  </tr>
                                </tbody>
                              </Table>
                            </Col>

                            {propertyView?.building_fee ||
                              propertyView?.other_features_building ||
                              propertyView?.other_features_real_estate ||
                              propertyView?.energy_class ? (
                              <>
                                <Col lg={12}>
                                  <Table responsive bordered>
                                    <h2 className="mainhead mb-0">
                                      Property optional detail
                                    </h2>
                                    <tbody>
                                      <tr>
                                        {propertyView?.other_features_real_estate ==
                                          "" ? (
                                          ""
                                        ) : (
                                          <>
                                            <th>Other features</th>
                                            <td>
                                              {propertyView?.other_features_real_estate +
                                                ","}
                                            </td>
                                          </>
                                        )}
                                        {propertyView?.other_features_building ==
                                          "" ? (
                                          ""
                                        ) : (
                                          <>
                                            <th>Building features</th>
                                            <td>
                                              {propertyView?.other_features_building +
                                                ","}
                                            </td>
                                          </>
                                        )}
                                      </tr>

                                      <tr>
                                        {propertyView?.energy_class ? (
                                          <>
                                            <th>Energy efficiency rating</th>
                                            <td>
                                              {propertyView?.energy_class ??
                                                "-"}
                                            </td>
                                          </>
                                        ) : (
                                          ""
                                        )}

                                        {propertyView?.building_fee == null ? (
                                          ""
                                        ) : (
                                          <>
                                            <th>
                                              ({constant.EURO})Building fee
                                            </th>
                                            <td>
                                              {constant.EURO}
                                              {Number(
                                                propertyView?.building_fee
                                              )?.toLocaleString()}
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    </tbody>
                                  </Table>
                                </Col>
                              </>
                            ) : (
                              ""
                            )}

                            <Col lg={12}>
                              <Table responsive bordered>
                                <h2 className="mainhead mb-0">
                                  Location details
                                </h2>
                                <tbody>
                                  <tr>
                                    <th>Street</th>
                                    <td>{propertyView?.street}</td>
                                    <th>
                                      Building <noframes></noframes>umber
                                    </th>
                                    <td>{propertyView?.building_no}</td>
                                  </tr>

                                  <tr>
                                    <th>Place</th>
                                    <td>{propertyView?.place}</td>
                                    <th>Municipality</th>
                                    <td>{propertyView?.municipality}</td>
                                  </tr>
                                  <tr>
                                    <th>District</th>
                                    <td>{propertyView?.district}</td>
                                    <th>Postal code</th>
                                    <td>{propertyView?.postalCode}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Col>

                            <Col lg={12}>
                              <Table responsive bordered>
                                <tbody>
                                  <tr>
                                    <th>Image, Video and PDF</th>
                                    <td>
                                      <div className="imag-video d-flex align-items-center">
                                        {propertyView?.propertyImgId?.length > 0
                                          ? propertyView?.propertyImgId?.map(
                                            (file, index) => {
                                              if (
                                                propertyView.fileType &&
                                                propertyView.fileType[
                                                index
                                                ] === "video/mp4"
                                              ) {
                                                return (
                                                  <video
                                                    className="mx-2"
                                                    controls
                                                    src={
                                                      file
                                                        ? mediaUrl(file)
                                                        : "/static_image.jpg"
                                                    }
                                                    width="200px"
                                                    height="150px"
                                                  />
                                                );
                                              } else if (
                                                propertyView.fileType &&
                                                propertyView.fileType[
                                                index
                                                ] === "application/pdf"
                                              ) {
                                                return (
                                                  <img
                                                    className="mx-2"
                                                    src="/pdf-icon.png"
                                                    style={{
                                                      objectFit: "contain",
                                                    }}
                                                    width="200px"
                                                    height="150px"
                                                  />
                                                );
                                              } else {
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
                                              }
                                            }
                                          )
                                          : propertyView?.image?.map(
                                            (file, index) => {
                                              if (file) {
                                                return (
                                                  <img
                                                    className="mx-2"
                                                    src={file.replace(/(\.jpg|\.png|\.jpeg|\.gif|\.svg).*/, '$1')}
                                                    width="200px"
                                                    height="150px"
                                                  />
                                                );
                                              }
                                            }
                                          )}
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </Container>
              </section>
            </>
          )}
        </div>
        <AdminFooter />
      </div>
    </>
  );
};

export default ViewProperty;
