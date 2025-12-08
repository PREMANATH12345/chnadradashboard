import { publicAxios, privateAxios, privateAxios1 ,mediaAxios, publicAxiosMedia} from "./axios";


export const DoAll = async(data) =>{
  const response = await privateAxios.post("/doAll", data);
  return response;
}

export const UploadsAws = async (data) => {
  const response = await publicAxiosMedia.post("/uploadAws", data);
  return response;
} 