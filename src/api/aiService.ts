import {axios} from "../utils/request";
import {AI_MODULE} from "./_prefix";

export const askAIAssistant = async (question: string) => {
    return axios
        .post(`${AI_MODULE}/answer`, {question})
        .then((res) => res.data);
};