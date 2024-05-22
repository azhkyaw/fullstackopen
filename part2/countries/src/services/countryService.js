import axios from "axios";
const BASE_URL = "https://studies.cs.helsinki.fi/restcountries";

const getAll = () => {
  return axios.get(BASE_URL + "/api/all").then((res) => res.data);
};

export default { getAll };
