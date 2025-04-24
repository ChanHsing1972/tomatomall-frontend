import { axios } from "../utils/request";
import {ADVERTISEMENT_MODULE, PRODUCT_MODULE} from "./_prefix";


type advertisementInfo = {
    id: string;
    title: string;
    content: string;
    imgUrl: string;
    productId: string;
}

type createAdvertisementInfo = {
    title: string;
    content: string;
    imgUrl: string;
    productId: string;
}

export const getAllAds = () => {
    return axios.get(`${ADVERTISEMENT_MODULE}`).then((res) => {
        return res;
    });
};

export const updateAd =(advertisementInfo:advertisementInfo)=> {
    return axios.put(`${ADVERTISEMENT_MODULE}`, advertisementInfo, {
        headers: {"Content-Type": "application/json"},
    });
};

export const addAd = (createAdvertisementInfo: createAdvertisementInfo) => {
    console.log(createAdvertisementInfo);
    return axios
        .post(`${PRODUCT_MODULE}`, createAdvertisementInfo, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};

export const deleteAd = (id: string) => {
    return axios.delete(`${ADVERTISEMENT_MODULE}/${id}`);
};

