/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { React, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import "./App.scss";
import Search from "./Search/Search";
import Searchdetail from "./Search/Searchdetail";
import About from "./about/About";
import NotFound from "./components/NotFound";
import Contact from "./contact/Contact";
import Cookies from "./cookies/Cookies";
import Faq from "./faq/Faq";
import Home from "./home/Home";
import Privacy from "./privacy/Privacy";
import Profile from "./profile/Profile";
import AdminRoutes from "./routes/AdminRoutes";
import RealAuthRoute from "./routes/RealAuthRoute";
import Terms from "./terms/Terms";
import {
  AdminAuth,
  PublicAuth,
  RealStateAgentAuth,
} from "./utils/ProtectedRoutes";
import ScrollTop from "./utils/ScrollTop";
import ProductListWithoutAuth from "./Search/ProductListWithoutAuth";
import ReactGA from 'react-ga4';

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && String(gaId).startsWith("G-")) {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
      });
    }
  }, [location]);
};

function App() {
  usePageTracking();
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="*" element={<AdminAuth />}>
          <Route path="admin/*" element={<AdminRoutes />} />
        </Route>
        <Route path="*" element={<RealStateAgentAuth />}>
          <Route path="customer/*" element={<RealAuthRoute />} />
        </Route>
        <Route path="*" element={<PublicAuth />}>
          <Route path="*" element={<NotFound />} />
          <Route path="" element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="product-list" element={<ProductListWithoutAuth />} />

          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/faq" element={<Faq />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/terms-conditions" element={<Terms />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/cookie-policy" element={<Cookies />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="search-detail/:id" element={<Searchdetail />} />
      </Routes>
    </>
  );
}

export default App;
