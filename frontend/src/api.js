import axios from "axios";

 
const API = axios.create({
    baseURL: import.meta.env.VITE_NODE_URL
});

export const executeCode = async (language, sourceCode) => {
  const response = await API.post("/execute", {
    language: language,
    content: sourceCode,
  });
  return response.data;
};



// import { LANGUAGE_VERSIONS } from "./constants";

// const API = axios.create({
//   baseURL: "https://emkc.org/api/v2/piston",
// });

// export const executeCode = async (language, sourceCode) => {
//   const response = await API.post("/execute", {
//     language: language,
//     version: LANGUAGE_VERSIONS[language],
//     files: [
//       {
//         content: sourceCode,
//       },
//     ],
//   });
//   return response.data;
// };