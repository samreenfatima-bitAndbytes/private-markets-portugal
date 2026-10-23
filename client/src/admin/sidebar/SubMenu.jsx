/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta

All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useSlider from "../../hooks/useSlider";

const MOBILE_BP = 991;

/** Related detail/edit routes that should keep the list item active. */
const RELATED_PREFIXES = {
  "/admin/dashboard": ["/admin/dashboard"],
  "/admin/user-list": ["/admin/view-user"],
  "/admin/product-list": [
    "/admin/view-product",
    "/admin/add-product",
    "/admin/edit-product",
  ],
  "/admin/property-list": ["/admin/view-property"],
  "/admin/property-type": ["/admin/view-property-type"],
  "/admin/order-list": ["/admin/view-order"],
  "/admin/payment-list": ["/admin/view-payment"],
  "/admin/message-queue": ["/admin/view-message"],
  "/admin/email-queue": ["/admin/email-view"],
  "/admin/login-activity": ["/admin/view-login-activity"],
  "/admin/cms-list": ["/admin/view-cms", "/admin/add-cms", "/admin/edit-cms"],
  "/admin/faq-list": ["/admin/view-faq", "/admin/add-faq", "/admin/edit-faq"],
  "/admin/contact-list": ["/admin/view-contact"],
};

function isPathActive(pathname, menuPath) {
  if (!menuPath) return false;
  if (pathname === menuPath) return true;
  const related = RELATED_PREFIXES[menuPath] || [];
  return related.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

const SubMenu = ({ item }) => {
  const slider = useSlider();
  const location = useLocation();
  const pathname = location.pathname;
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth <= MOBILE_BP
  );

  const childActive = useMemo(
    () =>
      Boolean(item?.subNav?.some((sub) => isPathActive(pathname, sub.path))),
    [item?.subNav, pathname]
  );

  const selfActive = isPathActive(pathname, item.path);
  const sectionActive = selfActive || childActive;

  const [subnav, setSubnav] = useState(childActive);
  const [addClass, setAddClass] = useState("");

  /** Desktop collapsed rail uses hover flyouts; mobile drawer uses accordion. */
  const flyoutMode = Boolean(slider && !isMobile);
  const accordionMode = !slider || isMobile;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (childActive) {
      setSubnav(true);
    }
  }, [childActive, pathname]);

  /* Hide flyout content while mobile drawer is closed */
  useEffect(() => {
    if (isMobile && slider) {
      setSubnav(false);
      setAddClass("");
    } else if (childActive) {
      setSubnav(true);
    }
  }, [isMobile, slider, childActive]);

  const linkClassName = [
    "sidebar-link",
    flyoutMode && addClass ? addClass : "",
    sectionActive ? "active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Link
        onMouseEnter={() => {
          if (!flyoutMode) return;
          setAddClass("nav-hover");
          setSubnav(true);
        }}
        onMouseLeave={() => {
          if (!flyoutMode) return;
          setAddClass("");
          if (!childActive) setSubnav(false);
        }}
        to={item.path || "#"}
        onClick={(e) => {
          if (!item.path && item.subNav) {
            e.preventDefault();
          }
          if (accordionMode && item.subNav) {
            setSubnav((open) => (childActive ? true : !open));
          }
        }}
        className={linkClassName}
        aria-current={sectionActive ? "page" : undefined}
      >
        <span className="value">
          {item.icon}
          <span className="sidebar-link__label">{item.title}</span>
        </span>
        <span className="icon">
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
              ? item.iconClosed
              : null}
        </span>
      </Link>
      <div
        className={`subnav${childActive || subnav ? " subnav--open" : ""}`}
        onMouseEnter={() => {
          if (!flyoutMode) return;
          setAddClass("nav-hover");
          setSubnav(true);
        }}
        onMouseLeave={() => {
          if (!flyoutMode) return;
          setAddClass("");
          if (!childActive) setSubnav(false);
        }}
      >
        {subnav &&
          item?.subNav?.map((subItem, index) => {
            const subActive = isPathActive(pathname, subItem.path);
            return (
              <Link
                to={subItem.path}
                key={index}
                className={`sidebar-link${subActive ? " active" : ""}`}
                aria-current={subActive ? "page" : undefined}
              >
                {subItem.icon}
                <span className="sidebar-link__label">{subItem.title}</span>
              </Link>
            );
          })}
      </div>
    </>
  );
};

export default SubMenu;
