import {axios} from "../utils/request";
import {AI_MODULE} from "./_prefix";

export interface AIQuestionRequest {
    question: string;
}

export interface AIAnswerResponse {
    answer: string;
}

export const askAIAssistant = async (question: string) => {
    return axios
        .post(`${AI_MODULE}/answer`, {question})
        .then((res) => res.data);
};
