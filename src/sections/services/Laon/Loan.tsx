import { Stack, Tab, Tabs, Button, Card } from "@mui/material";
import React, { useState } from "react";
import BusinessLoan from "src/assets/LoanIcon/BusinessLoan";
import GoldLoan from "src/assets/LoanIcon/GoldLoan";
import HomeLoan from "src/assets/LoanIcon/HomeLoan";
import PersonalLoan from "src/assets/LoanIcon/PersonalLoan";
import HomeLoans from "./HomeLoans";

function Loan(props: any) {
  const [sub_category, setSubCategory] = useState<any>();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSubCategory(newValue);
  };

  const [activeTab, setActiveTab] = useState<any>();

  const handleTabChange = (tabNumber: any) => {
    setActiveTab(tabNumber);

    console.log("..........dfsd.f.......df", tabNumber);
  };

  return (
    <div>
      <Card style={{ width: "100%", borderRadius: "3px" }}>
        <Stack flexDirection="row" gap={2}>
          {props?.supCategory?.sub_category?.map((item: any, index: any) => (
            <Button
              key={index}
              onClick={() => handleTabChange(item)}
              style={{
                color: activeTab === index ? "#4CAF50" : "", // Change this color as needed
              }}
            >
              {item?.sub_category_name === "Business Loan" ? (
                <BusinessLoan />
              ) : item?.sub_category_name === "Home Loan" ? (
                <HomeLoan />
              ) : item?.sub_category_name === "Gold Loan" ? (
                <GoldLoan />
              ) : item?.sub_category_name === "Personal Loan" ? (
                <PersonalLoan />
              ) : (
                "mmmmmm"
              )}
            </Button>
          ))}
        </Stack>
      </Card>

      {activeTab?.sub_category_name == "Home Loan" ? (
        <Stack>
          <HomeLoans />
        </Stack>
      ) : (
        activeTab === 1
      )}

      {activeTab === 1 && (
        <div>
          <h2>Tab 2 Content</h2>
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <h2>Tab 3 Content</h2>
        </div>
      )}
      {activeTab === 3 && (
        <div>
          <h2>Tab 4 Content</h2>
        </div>
      )}
      {activeTab === 4 && (
        <div>
          <h2>Tab 4 Content</h2>
        </div>
      )}
    </div>
  );
}

export default Loan;
