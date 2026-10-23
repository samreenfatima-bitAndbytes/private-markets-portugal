/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useQuery } from "@tanstack/react-query";
import { React } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Loader from "../Loader/Loader";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { staticPages } from "../services/Services";
import { constant } from "../utils/constant";
import "./about.scss";
import { mediaUrl } from "../utils/mediaUrl";

function About() {
  const { t } = useTranslation();

  const { data: aboutUsQuery, isFetching } = useQuery({
    queryKey: ["aboutUsQuery"],
    queryFn: async () => {
      const resp = await staticPages(constant.CMS_ABOUT);
      return resp?.data?.data ?? "";
    },
  });

  return (
    <>
      <Header />
      <section className="breadcrumbs">
        <div className="breadcrumbs_overly">
          <Container>
            <Row>
              <Col className="justify-content-center">
                <div className="breadcrumb_text">
                  <h1>{t("ABOUT_US")}</h1>
                  <svg
                    width="536"
                    height="1"
                    viewBox="0 0 536 1"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="-4.37114e-08"
                      y1="0.5"
                      x2="268"
                      y2="0.499977"
                      stroke="url(#paint0_linear_88_135)"
                    />
                    <line
                      y1="-0.5"
                      x2="268"
                      y2="-0.5"
                      transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 536 1.00006)"
                      stroke="url(#paint1_linear_88_135)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_88_135"
                        x1="4.37114e-08"
                        y1="1.5"
                        x2="268"
                        y2="1.49998"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" stopOpacity="0" />
                        <stop offset="1" stopColor="white" />
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear_88_135"
                        x1="0"
                        y1="0.5"
                        x2="268"
                        y2="0.5"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" stopOpacity="0" />
                        <stop offset="1" stopColor="white" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>
      <section className="aboutus aboutus--split">
        <Container fluid="xl">
          <Row className="align-items-stretch g-4 gx-lg-5">
            {aboutUsQuery ? (
              <>
                <Col lg={7}>
                  <div className="cms-content">
                    <h2 className="mb-3">{aboutUsQuery?.title}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: aboutUsQuery?.description,
                      }}
                    />
                  </div>
                </Col>
                <Col lg={5}>
                  <img
                    src={
                      aboutUsQuery?.image
                        ? mediaUrl(aboutUsQuery?.image)
                        : "/about-us.jpg"
                    }
                    className="about-img"
                    alt={aboutUsQuery?.title || "About Private Markets"}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/about-us.jpg";
                    }}
                  />
                </Col>
              </>
            ) : (
              <div className="text-center">{t("DATA_NOT_FOUND")}</div>
            )}
          </Row>
        </Container>
      </section>
      <Footer />
      {isFetching && <Loader />}
    </>
  );
}

export default About;
