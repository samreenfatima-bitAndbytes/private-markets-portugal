/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta

All Rights Reserved.
*/
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import CustomSelect from "../components/CustomSelect";
import Autocomplete from "../components/GeoSearch";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useToken from "../hooks/useToken";
import { getPropertySearch } from "../services/Services";
import { constant } from "../utils/constant";
import {
  PROPERTY_IMG_FALLBACK,
  propertyThumbUrl,
} from "../utils/propertyImages";
import { truncate } from "../utils/Functions";
import "./home.scss";

const DISTRICTS = [
  "Lisboa",
  "Porto",
  "Faro",
  "Braga",
  "Setúbal",
  "Coimbra",
  "Aveiro",
];

/** Matches seeded listing `type_of_real_estate` values (not CMS categories). */
const PROPERTY_TYPES = [
  "FLAT / APARTMENT",
  "DUPLEX",
  "PENTHOUSE",
  "STUDIO APARTMENT/LOFT",
];

function Home() {
  const { t } = useTranslation();
  const token = useToken();
  const navigate = useNavigate();

  const [search, setSearch] = useState({
    parish: "",
    municipality: "",
    district: "",
    name: "",
    typed: "",
    lat: 0,
    lng: 0,
    property_type: "",
  });

  const goToResults = (state) => {
    if (token) {
      navigate("/customer/property-listing", { state });
    } else {
      navigate("/search", { state });
    }
  };

  const handleSearch = () => {
    const typed = (search?.typed || "").trim();
    const selectedName = (search?.name || "").trim();
    const queryText = selectedName || typed || search?.district || "";
    // Free-text without a suggestion → treat as district/name search
    const district =
      search?.district ||
      (!selectedName && typed && !typed.includes(",") ? typed : "") ||
      "";

    goToResults({
      parish: search?.parish || "",
      municipality: search?.municipality || "",
      district,
      name: queryText,
      lat: search?.lat || 0,
      lng: search?.lng || 0,
      property_type: search?.property_type || "",
    });
  };

  const searchDistrict = (district) => {
    goToResults({
      parish: "",
      municipality: "",
      district,
      name: district,
      lat: 0,
      lng: 0,
      property_type: search?.property_type || "",
    });
  };

  const { data: featured = [], isFetching: featuredLoading } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const resp = await getPropertySearch({
        page: 1,
        limit: 6,
        search: "",
      });
      return resp?.data?.data ?? [];
    },
  });

  const detailPath = (id) =>
    token ? `/customer/property-detail/${id}` : `/search-detail/${id}`;

  return (
    <>
      <Header />

      <section className="home-hero py-0">
        <div className="home-hero__bg">
          <Container>
            <div className="home-hero__inner">
              <p className="home-hero__brand">Private Markets</p>
              <h1 className="home-hero__title">
                {t("FIND_YOUR_INVESTMENT_IN_PORTUGAL")}
              </h1>
              <p className="home-hero__lead">
                Browse verified Portuguese listings, save searches, and unlock
                full data packs — built for buyers and agents.
              </p>

              <div className="home-search">
                <Row className="g-2 align-items-stretch">
                  <Col md={3}>
                    <div className="home-search__field home-search__field--select">
                      <CustomSelect
                        className="pm-select--embedded"
                        aria-label={t("PROPERTY_TYPE")}
                        value={search?.property_type ?? ""}
                        onChange={(val) =>
                          setSearch({
                            ...search,
                            property_type: val,
                          })
                        }
                        placeholder="Any property type"
                        options={[
                          { value: "", label: "Any property type" },
                          ...PROPERTY_TYPES.map((type) => ({
                            value: type,
                            label: type,
                          })),
                        ]}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="home-search__field home-search__field--query d-flex align-items-center">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M16.4567 15.4843L12.4106 11.2762C13.451 10.0396 14.0209 8.48359 14.0209 6.86374C14.0209 3.07913 10.9418 0 7.1572 0C3.37259 0 0.293457 3.07913 0.293457 6.86374C0.293457 10.6484 3.37259 13.7275 7.1572 13.7275C8.578 13.7275 9.93194 13.299 11.0895 12.4854L15.1663 16.7255C15.3367 16.9024 15.5659 17 15.8115 17C16.044 17 16.2645 16.9114 16.4319 16.7502C16.7876 16.4079 16.799 15.8403 16.4567 15.4843ZM7.1572 1.79054C9.95462 1.79054 12.2304 4.06632 12.2304 6.86374C12.2304 9.66117 9.95462 11.9369 7.1572 11.9369C4.35978 11.9369 2.084 9.66117 2.084 6.86374C2.084 4.06632 4.35978 1.79054 7.1572 1.79054Z"
                          fill="#ABABAB"
                        />
                      </svg>
                      <Autocomplete
                        placeholder="City or district (e.g. Lisboa, Faro)"
                        name="search"
                        className="border-0 w-100 ms-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        onQueryChange={(typed) => {
                          setSearch((p) => ({
                            ...p,
                            typed,
                            parish: "",
                            municipality: "",
                            district: "",
                            name: "",
                          }));
                        }}
                        onPlaceSelected={(place) => {
                          const name = [
                            place?.parish,
                            place?.municipality,
                            place?.district,
                          ]
                            .filter(Boolean)
                            .join(", ");
                          setSearch((p) => ({
                            ...p,
                            parish: place?.parish || "",
                            municipality: place?.municipality || "",
                            district: place?.district || "",
                            name,
                            typed: name,
                          }));
                        }}
                      />
                    </div>
                  </Col>
                  <Col md={3} className="d-flex gap-2">
                    <button
                      className="btn btn-theme home-search__submit flex-grow-1"
                      type="button"
                      onClick={handleSearch}
                    >
                      {t("SEARCH")}
                    </button>
                  </Col>
                </Row>
                <div className="home-search__hint">
                  Tip: pick a suggestion, use a district below, or click Search
                  to browse all listings.
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      <section className="home-districts py-5">
        <Container>
          <div className="home-section-head">
            <h2>Explore by district</h2>
            <p>Jump straight into markets with live inventory.</p>
          </div>
          <div className="home-district-chips">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                type="button"
                className="home-chip"
                onClick={() => searchDistrict(d)}
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              className="home-chip home-chip--accent"
              onClick={handleSearch}
            >
              View all listings
            </button>
          </div>
        </Container>
      </section>

      <section className="home-featured py-5">
        <Container>
          <div className="home-section-head d-flex flex-wrap justify-content-between align-items-end gap-3">
            <div>
              <h2>Featured properties</h2>
              <p>Verified listings with photos and investment metrics.</p>
            </div>
            <button
              type="button"
              className="btn btn-theme2"
              onClick={handleSearch}
            >
              Browse marketplace
            </button>
          </div>

          <Row className="g-4 mt-1">
            {featuredLoading && (
              <Col xs={12}>
                <p className="text-muted mb-0">Loading listings…</p>
              </Col>
            )}
            {!featuredLoading && featured.length === 0 && (
              <Col xs={12}>
                <p className="text-muted mb-0">
                  No listings yet. Refresh the page or clear site data to
                  re-seed the demo.
                </p>
              </Col>
            )}
            {featured.map((data) => (
              <Col lg={4} md={6} key={data?._id}>
                <article className="home-card">
                  <Link to={detailPath(data?._id)} className="home-card__media">
                    <img
                      src={propertyThumbUrl(data)}
                      alt={data?.name || "Property"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PROPERTY_IMG_FALLBACK;
                      }}
                    />
                  </Link>
                  <div className="home-card__body">
                    <p className="home-card__type">
                      {data?.type_of_real_estate} · {data?.place}
                    </p>
                    <h3>
                      <Link to={detailPath(data?._id)}>
                        {truncate(data?.name || data?.street, 48)}
                      </Link>
                    </h3>
                    <p className="home-card__price">
                      {constant.EURO}
                      {Number(data?.price || 0).toLocaleString()}
                    </p>
                    <ul className="home-card__meta">
                      <li>{data?.rooms ?? 0} rooms</li>
                      <li>{data?.gross_area ? `${data.gross_area} m²` : "—"}</li>
                      <li>
                        {data?.expectedRentalYield
                          ? `${data.expectedRentalYield}% yield`
                          : "—"}
                      </li>
                    </ul>
                    <Link
                      className="home-card__cta"
                      to={detailPath(data?._id)}
                    >
                      View details
                    </Link>
                  </div>
                </article>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="home-steps py-5">
        <Container>
          <div className="home-section-head text-center mx-auto">
            <h2>How it works</h2>
            <p>Three roles, one marketplace — built for buyers and agents.</p>
          </div>
          <Row className="g-4">
            <Col md={4}>
              <div className="home-step">
                <span className="home-step__num">01</span>
                <h3>Search Portugal</h3>
                <p>
                  Filter by type and district, then open live property details
                  with photos and investment metrics.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="home-step">
                <span className="home-step__num">02</span>
                <h3>Save &amp; shortlist</h3>
                <p>
                  Buyers favourite homes and save searches; agents manage their
                  own listings from one dashboard.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="home-step">
                <span className="home-step__num">03</span>
                <h3>Unlock data packs</h3>
                <p>
                  Purchase CSV / market packs from Download Full List when you
                  need the complete export.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </>
  );
}

export default Home;
