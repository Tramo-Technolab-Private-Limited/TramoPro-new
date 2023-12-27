import React, { useContext, useEffect, useState } from "react";
import { Tab, Tabs, Card, Box, Grid } from "@mui/material";
import { StyledSection } from "src/layouts/login/styles";
import Image from "src/components/image/Image";
// sections
import { DTH } from ".";
import MobilePrepaid from "./Prepaid";
import RechargeImg from "../../../assets/images/RechargeTopUp.png";
import { CategoryContext } from "../../../pages/Services";

// ----------------------------------------------------------------------

export const SubCategoryContext = React.createContext("");

export default function Recharges() {
  const categoryContext: any = useContext(CategoryContext);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [currentTab, setCurrentTab] = useState("Mobile Prepaid");

  useEffect(() => {
    setCurrentTab(categoryContext.sub_category[0].sub_category_name);
    setSubcategoryId(categoryContext.sub_category[0]._id);
  }, []);

  const changeTab = (val: any) => {
    setCurrentTab(val.sub_category_name);
    setSubcategoryId(val._id);
  };

  return (
    <Grid
      display={"grid"}
      gridTemplateColumns={{ xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }}
    >
      <Card
        sx={{
          height: "fit-content",
          width: { xs: "100%", sm: "70%" },
        }}
      >
        <Tabs
          value={currentTab}
          aria-label="basic tabs example"
          sx={{ background: "#F4F6F8" }}
        >
          {categoryContext.sub_category.map((tab: any) => (
            <Tab
              key={tab._id}
              sx={{ mx: 3 }}
              label={tab.sub_category_name}
              value={tab.sub_category_name}
              onClick={() => changeTab(tab)}
            />
          ))}
        </Tabs>
        <SubCategoryContext.Provider value={subcategoryId}>
          {categoryContext.sub_category.map(
            (tab: any) =>
              tab.sub_category_name == currentTab && (
                <Box key={tab.sub_category_name} sx={{ m: 3 }}>
                  {currentTab == "Mobile Prepaid" ? <MobilePrepaid /> : <DTH />}
                </Box>
              )
          )}
        </SubCategoryContext.Provider>
      </Card>
      <StyledSection>
        <Image
          disabledEffect
          visibleByDefault
          src={RechargeImg}
          alt=""
          sx={{ height: "540px" }}
        />
      </StyledSection>
    </Grid>
  );
}
