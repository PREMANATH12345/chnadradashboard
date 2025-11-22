import { publicAxios, privateAxios, privateAxios1 ,mediaAxios, publicAxiosMedia} from "./axios";


export const DoAll = async(data) =>{
  const response = await privateAxios.post("/doAll", data);
  return response;
}

export const UploadCrm = async (data) => {
  const response = await mediaAxios.post("/UploadCrm", data);
  return response;
};

export const DoAllNoAu = async (data) => {
  const response = await publicAxios.post("/doAll", data);
  return response;
};

export const UploadCrmNoAu = async (data) => {
  const response = await publicAxiosMedia.post("/UploadCrm", data);
  return response;
};

export const UploadsAws = async (data) => {
  const response = await publicAxiosMedia.post("/uploadAws", data);
  return response;
} 