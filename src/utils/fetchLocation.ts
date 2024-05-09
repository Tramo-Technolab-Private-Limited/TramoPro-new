export const fetchLocation = async () => {
  let location: any = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  let userAgent: any = navigator.userAgent;
  localStorage.setItem("userAgent", userAgent);
  localStorage.setItem(
    "deviceType",
    userAgent.match(/Android/i)
      ? "android"
      : userAgent.match(/mac/i)
      ? "macbook"
      : "windows"
  );
  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("ip", data.ip);
    });
  localStorage.setItem("lat", location.coords.latitude);
  localStorage.setItem("long", location.coords.longitude);
  return location;
};
