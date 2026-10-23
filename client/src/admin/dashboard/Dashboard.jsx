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
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaBoxOpen, FaCreditCard, FaEnvira, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useSlider from "../../hooks/useSlider";
import {
  adminDashboardCounts,
  adminGraphData,
} from "../../services/AdminServices";
import CustomSelect from "../../components/CustomSelect";
import AdminFooter from "../components/AdminFooter";
import Sidebar from "../sidebar/Sidebar";
import DashboardChart from "./DashboardChart";

const Dashboard = () => {
  const isSlider = useSlider();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
  const [dashboard, setDashboard] = useState([]);
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const dashboardCount = useQuery({
    queryKey: ["dashboardCount"],
    queryFn: async () => {
      const resp = await adminDashboardCounts();
      return resp?.data?.data ?? "";
    },
  });

  useEffect(() => {
    getGraphCounts(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getGraphCounts = async (year) => {
    try {
      const response = await adminGraphData(year);
      if (response?.status === 200) {
        setDashboard(response?.data?.data?.map((row) => row) ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const years = Array.from(
    { length: 50 },
    (_, index) => new Date().getFullYear() - index
  );
  const yearOptions = years.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  return (
    <div className="mainbox">
      <Sidebar />
      <div className={isSlider ? "body-content close" : "body-content open"}>
        <h2 className="mainhead">Dashboard</h2>
        <div className="dash-widget">
          <Row>
            <Col xl={3} lg={6} md={6}>
              <div
                className="widgetcard"
                onClick={() => {
                  navigate("/admin/user-list");
                }}
              >
                <div className="value">
                  <p>Registered Users</p>
                  <h4>{dashboardCount?.data?.userCount ?? 0}</h4>
                </div>
                <div className="icon icon-two">
                  <FaUsers />
                </div>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6}>
              <div
                className="widgetcard"
                onClick={() => {
                  navigate("/admin/order-list");
                }}
              >
                <div className="value">
                  <p>Order</p>
                  <h4>{dashboardCount?.data?.orderCount ?? 0}</h4>
                </div>
                <div className="icon icon-one">
                  <FaBoxOpen />
                </div>
              </div>
            </Col>
            <Col xl={3} lg={6} md={6}>
              <div
                className="widgetcard"
                onClick={() => {
                  navigate("/admin/payment-list");
                }}
              >
                <div className="value">
                  <p>Payment</p>
                  <h4>{dashboardCount?.data?.paymentCount ?? 0}</h4>
                </div>
                <div className="icon icon-three">
                  <FaCreditCard />
                </div>
              </div>
            </Col>

            <Col xl={3} lg={6} md={6}>
              <div
                className="widgetcard"
                onClick={() => {
                  navigate("/admin/cms-list");
                }}
              >
                <div className="value">
                  <p>Cms</p>
                  <h4>{dashboardCount?.data?.cmsCount ?? 0}</h4>
                </div>
                <div className="icon icon-four">
                  <FaEnvira />
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="inner-wrap">
          <div className="custom-card">
            <Row>
              <Col xl={3} className="ms-auto mb-4">
                <CustomSelect
                  value={String(selectedYear)}
                  onChange={setSelectedYear}
                  options={yearOptions}
                  aria-label="Select year"
                  placeholder="Year"
                />
              </Col>
              <Col xl={12}>
                <div className="dashboard-chart">
                  <DashboardChart rows={dashboard} narrow={isNarrow} />
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default Dashboard;
