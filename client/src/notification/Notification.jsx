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
import { React, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import Loader from "../Loader/Loader";
import DataNotFound from "../components/DataNotFound";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UserSidebar from "../components/UserSidebar";
import {
  customerDeleteNotification,
  customerNotificationList,
} from "../services/Services";
import { toastAlert } from "../utils/SweetAlert";
import { constant } from "../utils/constant";
import "./notification.scss";

function Notification() {
  const { t } = useTranslation();

  const [pagination, setPagination] = useState({
    pageNo: constant.PAGE_NO_ONE,
    pageLimit: constant.PER_PAGE_FIVE,
  });
  const queryClient = useQueryClient();

  const { data: notificationList, isFetching } = useQuery({
    queryKey: [
      "notification-list",
      {
        page: pagination.pageNo,
        limit: pagination.pageLimit,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, query] = queryKey;
      const resp = await customerNotificationList(query);
      const { _meta } = resp?.data ?? {};
      setPagination((prevPagination) => ({
        ...prevPagination,
        totalCount: _meta?.totalCount,
        pageNo: _meta?.currentPage ?? prevPagination.pageNo,
        pageLimit: _meta?.perPage ?? prevPagination.pageLimit,
      }));
      return resp?.data?.data;
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: () => customerDeleteNotification(),
    onSuccess: () => {
      toastAlert("success", t("NOTIFICATION_DELETE_TOAST"));
      queryClient.invalidateQueries({ queryKey: ["notification-list"] });
    },
  });

  const handleClearNotifications = () => {
    if (notificationList && notificationList.length > 0) {
      deleteNotificationMutation.mutate();
    }
  };
  return (
    <>
      <Header />
      <section className="employee-dashbord">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <UserSidebar />
            </div>

            <div className="col-lg-9">
              <div className="emp-dash-card sidebox p-4">
                <div className="emp-das-hd d-flex align-items-center justify-content-between mb-4">
                  <h4 className="emp-dash-title">
                    {t("NOTIFICATIONS")}
                    <br />
                    <svg
                      width="119"
                      height="2"
                      viewBox="0 0 119 2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1H118"
                        stroke="#004aad"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </h4>
                  <Link
                    className="emp-hd-btn text-underline"
                    to="#"
                    onClick={handleClearNotifications}
                    disabled={
                      notificationList?.length === 0 ||
                      deleteNotificationMutation.isLoading
                    }
                  >
                    {t("CLEAR")}
                  </Link>
                </div>
                {notificationList?.length > 0 ? (
                  notificationList?.map((data, index) => {
                    return (
                      <div className="emp-dash-body cardbox" key={index}>
                        <div className="d-flex justify-content-between">
                          <div className="d-flex">
                            <svg
                              width="50"
                              height="50"
                              viewBox="0 0 50 50"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="25" cy="25" r="25" fill="#004aad" />
                              <g clip-path="url(#clip0_119_770)">
                                <path
                                  d="M25.5001 36C26.7589 36 27.843 35.2396 28.3186 34.1543H22.6815C23.1572 35.2396 24.2413 36 25.5001 36Z"
                                  fill="white"
                                />
                                <path
                                  d="M31.8575 25.1662V23.8184C31.8575 20.9546 29.9539 18.5273 27.3458 17.7345V16.8457C27.3458 15.828 26.5178 15 25.5 15C24.4823 15 23.6543 15.828 23.6543 16.8457V17.7345C21.0462 18.5273 19.1426 20.9545 19.1426 23.8184V25.1662C19.1426 27.6818 18.1838 30.0671 16.4427 31.8828C16.2721 32.0607 16.2241 32.3232 16.3208 32.55C16.4175 32.7767 16.6403 32.9238 16.8868 32.9238H34.1133C34.3598 32.9238 34.5825 32.7767 34.6792 32.55C34.7759 32.3232 34.728 32.0607 34.5574 31.8828C32.8163 30.0671 31.8575 27.6817 31.8575 25.1662ZM26.1153 17.4908C25.9128 17.4713 25.7076 17.4609 25.5 17.4609C25.2925 17.4609 25.0873 17.4713 24.8848 17.4908V16.8457C24.8848 16.5065 25.1608 16.2305 25.5 16.2305C25.8393 16.2305 26.1153 16.5065 26.1153 16.8457V17.4908Z"
                                  fill="white"
                                />
                                <path
                                  d="M33.4981 23.8183C33.4981 24.1581 33.7736 24.4336 34.1133 24.4336C34.4531 24.4336 34.7286 24.1581 34.7286 23.8183C34.7286 21.3533 33.7687 19.0358 32.0256 17.2927C31.7854 17.0525 31.3958 17.0525 31.1555 17.2927C30.9153 17.533 30.9153 17.9225 31.1555 18.1628C32.6662 19.6734 33.4981 21.6819 33.4981 23.8183Z"
                                  fill="white"
                                />
                                <path
                                  d="M16.8867 24.4335C17.2265 24.4335 17.502 24.1581 17.502 23.8183C17.502 21.682 18.3339 19.6735 19.8445 18.1628C20.0848 17.9225 20.0848 17.533 19.8445 17.2928C19.6043 17.0525 19.2147 17.0525 18.9745 17.2928C17.2314 19.0358 16.2715 21.3533 16.2715 23.8183C16.2715 24.1581 16.5469 24.4335 16.8867 24.4335Z"
                                  fill="white"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_119_770">
                                  <rect
                                    width="21"
                                    height="21"
                                    fill="white"
                                    transform="translate(15 15)"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                            &nbsp;&nbsp;
                            <div>
                              <h4 className="font18">{data?.title}</h4>
                              <p className="font15 mb-0">{data?.description}</p>
                            </div>
                          </div>
                          <p className="mb-0">
                            {moment(data?.createdAt).format("l LT")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <DataNotFound />
                  </div>
                )}

                {Math.ceil(pagination.totalCount / constant.PER_PAGE_FIVE) >
                  1 && (
                  <div>
                    <ReactPaginate
                      containerClassName={
                        "pagination position-relative mt-2 pt-3"
                      }
                      previousLinkClassName={"pagination__link"}
                      nextLinkClassName={"pagination__link"}
                      disabledClassName={"pagination__link--disabled"}
                      activeClassName={"pagination__link--active"}
                      previousLabel={"Prev"}
                      nextLabel={"Next"}
                      onPageChange={(props) => {
                        setPagination({
                          ...pagination,
                          pageNo: props.selected + 1,
                        });
                      }}
                      pageCount={Math.ceil(
                        pagination.totalCount / constant.PER_PAGE_FIVE
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      {isFetching && <Loader />}
    </>
  );
}

export default Notification;
