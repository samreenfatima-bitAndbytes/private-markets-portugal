/**
@copyright : Hotopics Unipessoal Lda. < www.toxsl.com >
@author    : Shiv Charan Panjeta 
 
All Rights Reserved.
Proprietary and confidential :  All information contained here in is, and remains
the property of Hotopics Unipessoal Lda. and it's partners.
Unauthorized copying of this file, via any medium is strictly prohibited.
*/
import React from "react";
import { Dropdown } from "react-bootstrap";
import { FaPen, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useDetails from "../../hooks/useDetails";
import useSlider from "../../hooks/useSlider";
import { slider } from "../../redux/features/sliderSlice";
import { SidebarIcon } from "../../utils/Icons";
import "../sidebar/sidebar.scss";
import { toastAlert } from "../../utils/SweetAlert";
import { useMutation } from "@tanstack/react-query";
import { logOut } from "../../services/Services";
import { login } from "../../redux/features/authSlice";
import { mediaUrl } from "../../utils/mediaUrl";

const AdminHeader = () => {
  const data = useDetails();
  const dispatch = useDispatch();
  const isSlider = useSlider();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logOut(),
    onSuccess: (resp) => {
      toastAlert("success", resp.data?.message);
      localStorage.clear();
      dispatch(login(""));
    },
  });

  return (
    <header className={isSlider ? "header close" : "header open"}>
      <ul>
        <div className="navicon">
          <span
            onClick={() => {
              if (isSlider) {
                dispatch(slider(false));
              } else {
                dispatch(slider(true));
              }
            }}
          >
            <SidebarIcon />
          </span>
        </div>
        <div className="header-right">
          <div className="admin-drop">
            <Dropdown>
              <Dropdown.Toggle id="dropdown-basic">
                <span className="img-ic">
                  <img
                    src={
                      data?.profileImgId
                        ? mediaUrl(data?.profileImgId)
                        : "/default.png"
                    }
                    width={60}
                    alt=""
                  />
                </span>
                <span className="d-none d-sm-inline">{data?.firstName}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/admin/profile")}>
                  <FaUser />
                  Profile
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => navigate("/admin/reset-password")}
                >
                  <FaPen />
                  Change Password
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(e) => {
                    e.preventDefault();
                    logoutMutation.mutate();
                  }}
                >
                  <FaSignOutAlt />
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </ul>
    </header>
  );
};

export default AdminHeader;
