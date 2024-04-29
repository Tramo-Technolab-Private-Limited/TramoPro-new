export const fetchLocation = async () => {
  let location: any = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  localStorage.setItem("lat", location.coords.latitude);
  localStorage.setItem("long", location.coords.longitude);
  return location;
};
