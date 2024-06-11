import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useAuthContext } from "src/auth/useAuthContext";

const DonutView = (props: any) => {
  const { Api } = useAuthContext();
  const [categoryList, setCategoryList] = useState<any>([]);

  useEffect(() => getCategoryList(), []);

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      console.log("======getcategory_list====>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          const filterCatgeory: any = [];
          Response?.data?.data.map(
            (item: any) =>
              item.isEnabled && filterCatgeory.push(item.category_name)
          );
          setCategoryList(filterCatgeory);
        }
      }
    });
  };

  const series = categoryList.map((item: any) =>
    Number(parseInt(String(Math.random() * 100)))
  );

  const options: any = {
    chart: {
      type: "donut",
      height: 650,
    },
    contextMenu: {
      menu: null,
    },
    labels: categoryList,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
          fill: {
            type: "gradient",
          },
        },
      },
    ],
  };

  return (
    <Stack>
      <Stack flexDirection="row" justifyContent="space-between" m={2}>
        <Typography variant="h6">Services </Typography>
        <select>
          <option value="option1">Today</option>
          <option value="option2">2023</option>
          <option value="option3">2024</option>
        </select>
      </Stack>
      <Stack>
        <Chart
          options={options}
          series={series}
          type="donut"
          height={props.chartHeight}
        />
      </Stack>
    </Stack>
  );
};

export default DonutView;
