function getRDServiceUrl(deviceName: any) {
  var rdUrl = "";
  if (deviceName == "MANTRA") {
    rdUrl = "http://127.0.0.1:11100/rd/capture";
  } else if (deviceName == "MORPHO") {
    rdUrl = "http://127.0.0.1:11100/capture";
  } else if (deviceName == "MORPHO L1") {
    rdUrl = "http://127.0.0.1:11101/capture";
  } else if (deviceName == "STARTEK") {
    rdUrl = "http://127.0.0.1:11100/rd/capture";
  } else if (deviceName == "SECUGEN") {
    rdUrl = "http://127.0.0.1:11100/rd/capture";
  }
  return rdUrl;
}

function xmlToJson(xml: any): any {
  var obj: any = {};

  if (xml.nodeType === 1) {
    // Element node
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // Text node
    obj = xml.nodeValue.trim();
  }

  // Children
  if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item: any = xml.childNodes.item(i);
      var nodeName: any = item.nodeName;

      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

export const CaptureDevice = async (val: any) => {
  return new Promise((resolve, reject) => {
    try {
      const rdUrl = getRDServiceUrl(val);
      if (rdUrl == "") {
        resolve({ error: "Device Not Set!", success: false });
      }

      var xhr: any;
      var ActiveXObject: any;
      var ua = window.navigator.userAgent;
      var msie = ua.indexOf("MSIE");
      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } else {
        xhr = new XMLHttpRequest();
      }

      xhr.open("CAPTURE", rdUrl, true);
      xhr.setRequestHeader("Content-Type", "text/xml");
      xhr.setRequestHeader("Accept", "text/xml");

      xhr.open("CAPTURE", rdUrl, true);
      xhr.setRequestHeader("Content-Type", "text/xml");
      // xhr.setRequestHeader('Accept', 'text/xml');
      if (!xhr) {
        resolve({ error: "CORS not supported!!", success: false });
      }

      xhr.onreadystatechange = async function () {
        if (xhr.readyState == 4) {
          var status = xhr.status;
          if (status == 200) {
            let xhrR = xhr.response;
            let parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xhrR, "text/xml");
            let xml = parser.parseFromString(xhrR, "application/xml");
            var pidContent = xml.getElementsByTagName("PidData")[0];
            var responseCode: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("errCode");
            var errInfo: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("errInfo");
            let device: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("dpId");

            if (responseCode == 0) {
              var jsonResult = xmlToJson(xmlDoc);

              resolve({
                error: false,
                success: {
                  errCode: jsonResult.PidData.Resp["@attributes"].errCode,
                  errInfo: jsonResult?.PidData.Resp["@attributes"].errInfo,
                  fCount: jsonResult?.PidData.Resp["@attributes"].fCount,
                  fType: jsonResult?.PidData.Resp["@attributes"].fType,
                  iCount: jsonResult?.PidData.Resp["@attributes"].iCount,
                  iType: null,
                  pCount: jsonResult?.PidData.Resp["@attributes"].pCount,
                  pType: "0",
                  nmPoints: jsonResult?.PidData.Resp["@attributes"].nmPoints,
                  qScore: jsonResult?.PidData.Resp["@attributes"].qScore,
                  dpID: jsonResult?.PidData.DeviceInfo["@attributes"].dpId,
                  rdsID: jsonResult?.PidData.DeviceInfo["@attributes"].rdsId,
                  rdsVer: jsonResult?.PidData.DeviceInfo["@attributes"].rdsVer,
                  dc: jsonResult?.PidData.DeviceInfo["@attributes"].dc,
                  mi: jsonResult?.PidData.DeviceInfo["@attributes"].mi,
                  mc: jsonResult?.PidData.DeviceInfo["@attributes"].mc,
                  ci: jsonResult?.PidData.Skey["@attributes"].ci,
                  sessionKey: jsonResult?.PidData.Skey["#text"],
                  hmac: jsonResult?.PidData.Hmac["#text"],
                  PidDatatype: jsonResult?.PidData.Data["@attributes"].type,
                  Piddata: jsonResult?.PidData.Data["#text"],
                },
              });
            } else {
              resolve({ error: errInfo, success: false });
            }
          }
        }
      };
      xhr.onerror = function () {
        resolve({ error: "Check If Morpho Service/Utility is Running" });
      };
      xhr.send(
        '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="P" wadh=""/> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>'
      );
    } catch (err) {
      resolve({ error: err.message, success: false });
    }
  });
};
