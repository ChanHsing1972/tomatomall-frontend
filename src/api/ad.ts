import {axios} from "../utils/request";
import {AD_MODULE} from "./_prefix";

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
    return axios.get(`${AD_MODULE}`).then((res) => {
        return res;
    });
};

export const updateAd = (advertisementInfo: advertisementInfo) => {
    return axios.put(`${AD_MODULE}`, advertisementInfo, {
        headers: {"Content-Type": "application/json"},
    });
};

export const addAd = (createAdvertisementInfo: createAdvertisementInfo) => {
    return axios
        .post(`${AD_MODULE}`, createAdvertisementInfo, {
            headers: {"Content-Type": "application/json"},
        })
        .then((res) => {
            return res;
        });
};

export const deleteAd = (id: string) => {
    return axios.delete(`${AD_MODULE}/${id}`);
};

