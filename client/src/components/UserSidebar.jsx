/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta

All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { mediaUrl } from "../utils/mediaUrl";
import {
  FaBell,
  FaBookmark,
  FaBuilding,
  FaCog,
  FaFileAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../Loader/Loader";
import useDetails from "../hooks/useDetails";
import { login } from "../redux/features/authSlice";
import { cart } from "../redux/features/cartSlice";
import { logOut } from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";

/** Dispatched from Header mobile navbar to open this account menu */
export const OPEN_ACCOUNT_MENU_EVENT = "pm:open-account-menu";

const UserSidebar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useDetails();
  const search = useLocation();
  const path = search?.pathname?.toString() || "";

  const logoutMutation = useMutation({
    mutationFn: () => logOut(),
    onSuccess: () => {
      toastAlert("success", t("LOGOUT_TOAST"));
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("persist:slider");
      dispatch(login(""));
      dispatch(cart(""));
    },
  });

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  useEffect(() => {
    const openMenu = (e) => {
      e?.detail?.ack?.();
      setShow(true);
    };
    window.addEventListener(OPEN_ACCOUNT_MENU_EVENT, openMenu);
    return () => window.removeEventListener(OPEN_ACCOUNT_MENU_EVENT, openMenu);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: t("ARE_YOU_SURE"),
      text: t("YOU_WANT_TO_LOGOUT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#004aad",
      cancelButtonColor: "#d33",
      confirmButtonText: t("LOGOUT"),
      cancelButtonText: t("CANCEL"),
    }).then((result) => {
      if (result.isConfirmed) {
        logoutMutation.mutate();
      }
    });
  };

  const propertyTo =
    data?.roleId === constant.REAL_STATE_AGENT
      ? "/customer/property-list"
      : "/customer/property-listing";

  const links = (
    <ul onClick={handleClose}>
      <li>
        <Link
          className={path === "/customer/file-list" ? "active" : ""}
          to={data?.token ? "/customer/file-list" : ""}
        >
          <span className="side-icon">
            <FaFileAlt />
          </span>
          {t("MY_FILES")}
        </Link>
      </li>
      <li>
        <Link
          className={
            path === "/customer/property-list" ||
            path === "/customer/property-listing"
              ? "active"
              : ""
          }
          to={data?.token ? propertyTo : ""}
        >
          <span className="side-icon">
            <FaBuilding />
          </span>
          {t("MY_PROPERTY")}
        </Link>
      </li>
      <li>
        <Link
          className={path === "/customer/save-search" ? "active" : ""}
          to={data?.token ? "/customer/save-search" : ""}
        >
          <span className="side-icon">
            <FaBookmark />
          </span>
          {t("SAVE_SEARCH")}
        </Link>
      </li>
      <li>
        <Link
          className={path === "/customer/notification" ? "active" : ""}
          to={data?.token ? "/customer/notification" : ""}
        >
          <span className="side-icon">
            <FaBell />
          </span>
          {t("NOTIFICATIONS")}
        </Link>
      </li>
      <li>
        <Link
          className={path === "/customer/agent-profile" ? "active" : ""}
          to="/customer/agent-profile"
        >
          <span className="side-icon">
            <FaUser />
          </span>
          {t("MY_ACCOUNT")}
        </Link>
      </li>
      <li>
        <Link
          className={path === "/customer/change-password" ? "active" : ""}
          to="/customer/change-password"
        >
          <span className="side-icon">
            <FaCog />
          </span>
          {t("SETTINGS")}
        </Link>
      </li>
      <li
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLogout();
        }}
      >
        <Link style={{ cursor: "pointer" }}>
          <span className="side-icon">
            <FaSignOutAlt />
          </span>
          {t("LOG_OUT")}
        </Link>
      </li>
    </ul>
  );

  const profileHead = (
    <div className="side-bar-hd text-center">
      <span className="employee-img">
        <img
          src={
            data?.profileImgId
              ? mediaUrl(data?.profileImgId)
              : "/default.png"
          }
          alt=""
        />
      </span>
      <h4>
        {data?.firstName} {data?.lastName}
      </h4>
      {data?.roleId === constant.CUSTOMER ? (
        <Link className="text-underline" to="/customer/cart">
          {t("GO_TO_CART")}&nbsp;
          <img src="../../arrow.png" alt="" />
        </Link>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="d-none d-lg-block employee-sidebar-sticky">
        <div className="employee-sidebar sidebox bg-white py-4">
          {profileHead}
          <hr className="mt-4 mb-4" />
          <div className="sidebar-links">{links}</div>
        </div>
      </div>

      <div className="d-block d-lg-none">
        <Offcanvas show={show} onHide={handleClose} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{t("DASHBOARD_MENU")}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="employee-sidebar shadow-none sidebox bg-white">
              {profileHead}
              <hr className="mt-4 mb-4" />
              <div className="sidebar-links">{links}</div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
      {logoutMutation?.isPending && <Loader />}
    </>
  );
};

export default UserSidebar;
