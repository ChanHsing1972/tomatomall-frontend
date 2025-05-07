import {axios} from "../utils/request";
import {READER_MODULE} from "./_prefix.ts";

export type Chapter = {
    chapterId: number;
    chapterNo: number;
    chapterTitle: string;
    chapterContent: string;
    prevChapterNo: number;
    nextChapterNo: number;
};

export const getChapterList = (productId: number | string) => {
    return axios.get(READER_MODULE + "/list", {
        params: {productId}
    });
};

export const getChapterDetail = (productId: number | string, chapterId: number | string) => {
    return axios.get(READER_MODULE, {
        params: {productId, chapterId}
    });
};