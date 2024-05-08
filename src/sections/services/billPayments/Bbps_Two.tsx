import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import {
  Tab,
  Tabs,
  FormControl,
  TextField,
  Autocomplete,
  Button,
  Grid,
  Card,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";

function Bbps_Two(props: any) {
  const { Api } = useAuthContext();
  const [superCurrentTab, setSuperCurrentTab] = useState("");
  const [vlist, setVlist] = useState([]);
  const [operators, setOperators] = useState<any>([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [dynamicFields, setDynamicFields] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");

  useEffect(() => {
    getLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation && selectedSubCategoryId) {
      getOperators();
    }
  }, [selectedLocation, selectedSubCategoryId]);

  useEffect(() => {
    if (selectedOperator) {
      getInput();
    }
  }, [selectedOperator]);

  const handleTabChange = (event: any, newValue: any) => {
    setSuperCurrentTab(newValue);
    setSelectedSubCategoryId(newValue);
  };

  const handleChangeOperator = (event: any, value: any) => {
    setSelectedOperator(value.props.value._id);
  };

  const getLocations = () => {
    let token = localStorage.getItem("token");
    Api(`bbps2/location`, "GET", "", token).then((Response: any) => {
      if (Response.status === 200 && Response.data.code === 200) {
        let locationsall = Response.data.data.map(
          (items: any) => items.location
        );
        locationsall.sort((a: string, b: any) => a.localeCompare(b));
        setVlist(locationsall);
      }
    });
  };

  const getOperators = () => {
    let token = localStorage.getItem("token");

    Api(
      `bbps2/operator?location=${selectedLocation}&subCategoryId=${selectedSubCategoryId}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status === 200 && Response.data.code === 200) {
        console.log("===========Response====>", Response.data);
        let res = Response.data.data.map((items: any) => items);
        setOperators(res);
      }
    });
  };

  const getInput = () => {
    let token = localStorage.getItem("token");

    Api(`bbps2/operatorParam/${selectedOperator}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status === 200 && Response.data.code === 200) {
          let param_labels = Response.data.data.map(
            (items: any) => items.param_label
          );
          setDynamicFields(param_labels);
        }
      }
    );
  };

  return (
    <>
      <Tabs
        value={superCurrentTab}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ bgcolor: "#F4F6F8", marginTop: "-20px" }}
        onChange={handleTabChange}
        aria-label="icon label tabs example"
      >
        {props.listvalue.map((tab: any) => (
          <Tab
            key={tab._id}
            sx={{ mx: 1, fontSize: { xs: 12, sm: 15 } }}
            label={tab.sub_category_name}
            value={tab._id}
          />
        ))}
      </Tabs>
      <Card
        sx={{
          display: "block",
          width: "30vw",
          transitionDuration: "0.3s",
          height: "42vh",
          marginTop: "5px",
        }}
      >
        <FormControl>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={vlist}
            sx={{ width: 300, marginTop: "10px", marginLeft: "20px" }}
            renderInput={(params) => (
              <TextField {...params} label="Location" size="small" />
            )}
            onChange={(event, newValue) => setSelectedLocation(newValue)}
          />
        </FormControl>
        <FormControl sx={{ width: 300, marginTop: "10px", marginLeft: "20px" }}>
          <InputLabel>Operator</InputLabel>
          <Select label="Operator" onChange={handleChangeOperator} size="small">
            <MenuItem value=""></MenuItem>
            {operators.map((item: any) => (
              <MenuItem key={item._id} value={item}>
                {item.productName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {dynamicFields.map((paramLabel, index) => (
          <FormControl key={index}>
            <TextField
              label={paramLabel}
              variant="outlined"
              size="small"
              sx={{ width: 300, marginTop: "10px", marginLeft: "20px" }}
            />
          </FormControl>
        ))}
        {selectedOperator && (
          <FormControl>
            <Button
              variant="contained"
              sx={{
                width: "22.5vw",
                marginLeft: "1.5vw",
                marginTop: "1vw",
              }}
            >
              Submit
            </Button>
          </FormControl>
        )}
      </Card>
    </>
  );
}

export default Bbps_Two;
