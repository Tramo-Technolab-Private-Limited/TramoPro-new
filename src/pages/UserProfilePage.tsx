import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
// @mui
import {
  Tab,
  Card,
  Tabs,
  Container,
  Box,
  CSSObject,
  SxProps,
  Grid,
  Typography,
  Button,
  Stack,
  Modal,
  Hidden,
} from "@mui/material";
// routes
import { PATH_DASHBOARD } from "../routes/paths";
// _mock_
import {
  _userAbout,
  _userFeeds,
  _userFriends,
  _userGallery,
  _userFollowers,
} from "../_mock/arrays";
// components
import Iconify from "../components/iconify";
import CustomBreadcrumbs from "../components/custom-breadcrumbs";
import { useSettingsContext } from "../components/settings";
// sections
import {
  Profile,
  ProfileCover,
  ProfileFriends,
  ProfileGallery,
  ProfileFollowers,
} from "../sections/profile";
import { Api } from "src/webservices";
import TramoCertificate from "../assets/icons/Tramo-Certificate-3.png";
import { AwsDocSign } from "../components/customFunctions/AwsDocSign";
import jsPDF from "jspdf";
import { useAuthContext } from "src/auth/useAuthContext";
import Image from "src/components/image/Image";
// ----------------------------------------------------------------------

export default function UserProfilePage() {
  const { themeStretch } = useSettingsContext();

  const { user } = useAuthContext();

  const [searchFriends, setSearchFriends] = useState("");

  const [currentTab, setCurrentTab] = useState("profile");
  const [modalOpen, setModalOpen] = useState(false);
  const componentRef = useRef<any>();
  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };
  const downloadAsPDF = () => {
    const pdf = new jsPDF("landscape");
    const element = componentRef.current;

    if (!element) {
      console.error("Component reference not found");
      return;
    }
    const width = 0;
    const height = 0;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
  };
  const [udata, setUdata] = useState({
    name: "",
    img: "",
    role: "",
    AEPS_wallet: "",
    main_wallet: "",
    GSTFile: "",
    PANFile: "",
    aadharFileUrl: "",
    aadharBackUrl: "",
    shopImage: ["", "", ""],
    userCode: "",
    _id: "",
    contact_no: "",
    createdAt: new Date(),
    approvalDate: "",
  });

  const formatDate = (date: any) => {
    const options: any = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatDateted = (date: any) => {
    const extendedDate = new Date(date);
    extendedDate.setFullYear(extendedDate.getFullYear() + 1);
    extendedDate.setDate(extendedDate.getDate() - 1);

    const options: any = { year: "numeric", month: "numeric", day: "numeric" };
    return extendedDate.toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    userdata();
  }, []);
  const userdata = async () => {
    try {
      let token = localStorage.getItem("token");
      await Api(`agent/get_AgentDetail`, "GET", "", token).then(
        (Response: any) => {
          console.log("====res=========>" + JSON.stringify(Response));
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              // setUdata(Response.data.data)
              setUdata({
                ...udata,
                name:
                  Response.data.data.firstName +
                  " " +
                  Response.data.data.lastName,
                img: Response.data.data.selfie[0],
                role: Response.data.data.role,
                AEPS_wallet: Response.data.data.AEPS_wallet_amount,
                main_wallet: Response.data.data.main_wallet_amount,
                GSTFile: Response.data.data.GSTFile,
                PANFile: Response.data.data.PANFile,
                aadharFileUrl: Response.data.data.aadharFileUrl,
                aadharBackUrl: Response.data.data.aadharBackUrl,
                shopImage: Response.data.data.shopImage,
                contact_no: Response.data.data.contact_no,
                userCode: Response.data.data.userCode,
                _id: Response.data.data._id,
                createdAt: Response.data.data.createdAt,
                approvalDate: Response.data.data.approvalDate,
              });
              console.log("==========udata=====>", Response.data.data);
            } else {
              let msg = Response.data.message;
              console.log("===404=============>", msg);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const TABS = [
    {
      value: "profile",
      label: "Profile",
      icon: <Iconify icon="ic:round-account-box" />,
      component: <Profile info={_userAbout} posts={_userFeeds} />,
    },
    // {
    //   value: "My Network",
    //   label: "My Network",
    //   icon: <Iconify icon="eva:heart-fill" />,
    //   component: <ProfileFollowers followers={_userFollowers} />,
    // },
    // {
    //   value: 'friends',
    //   label: 'Friends',
    //   icon: <Iconify icon="eva:people-fill" />,
    //   component: (
    //     <ProfileFriends
    //       friends={_userFriends}
    //       searchFriends={searchFriends}
    //       onSearchFriends={(event: React.ChangeEvent<HTMLInputElement>) =>
    //         setSearchFriends(event.target.value)
    //       }
    //     />
    //   ),
    // },
    // {
    //   value: 'gallery',
    //   label: 'Gallery',
    //   icon: <Iconify icon="ic:round-perm-media" />,
    //   component: <ProfileGallery gallery={_userGallery} />,
    // },
  ];

  return (
    <>
      <Helmet>
        <title> User: Profile | {process.env.REACT_APP_COMPANY_NAME} </title>
      </Helmet>

      <Card
        sx={{
          mb: 3,
          height: 280,
          position: "relative",
        }}
      >
        <ProfileCover
          name={user?.displayName}
          role={_userAbout.role}
          cover={""}
        />

        <Tabs
          value={currentTab}
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: "absolute",
            bgcolor: "background.paper",
            "& .MuiTabs-flexContainer": {
              pr: { md: 3 },
              justifyContent: {
                sm: "center",
                md: "flex-end",
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
          <Button onClick={openModal}>certificate</Button>
        </Tabs>
      </Card>
      {TABS.map(
        (tab) =>
          tab.value === currentTab && (
            <Box key={tab.value}> {tab.component} </Box>
          )
      )}

      <Modal
        open={modalOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            width: { xs: "95%", md: 600 },
            p: 4,
            borderRadius: "20px",
          }}
        >
          <Grid ref={componentRef}>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"27%"}
              left={"42%"}
            >
              {user?.firstName + " " + user?.lastName}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"75.5%"}
              left={"23%"}
            >
              {user?._id}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"44%"}
              left={"55%"}
            >
              {user?.contact_no}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"48%"}
              left={"57%"}
            >
              {user?.userCode}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"58.5%"}
              left={"58%"}
            >
              {formatDate(user?.createdAt)}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"61.5%"}
              left={"55%"}
            >
              {formatDate(user?.createdAt)}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"64.5%"}
              left={"55%"}
            >
              {formatDate(user?.approvalDate)}
            </Typography>
            <Typography
              variant="caption"
              position={"absolute"}
              top={"61.5%"}
              left={"66.5%"}
            >
              {formatDateted(user?.approvalDate)}
            </Typography>
            <img
              src={user?.selfie[0].length && AwsDocSign(user?.selfie[0])}
              width={90}
              height={85}
              style={{
                position: "absolute",
                top: "14.1%",
                left: "73%",
                borderRadius: "49%",
                overflow: "hidden",
              }}
            />
            <img src={TramoCertificate} alt="Certificate" />
          </Grid>
          <Stack flexDirection={"row"}>
            <Button onClick={closeModal}>close</Button>
            <Button onClick={downloadAsPDF}>Download PDF</Button>
          </Stack>
        </Grid>
      </Modal>
    </>
  );
}
