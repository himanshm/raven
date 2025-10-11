import {
  buildQueryParams,
  getAppVersion,
  getOrSetSessionId
} from "@/api/utils";
import type { QueryParams } from "@/types";
import axios, { type AxiosInstance } from "axios";

let instance: AxiosInstance | null = null;

const apiClient = (newInstance: boolean = false): AxiosInstance => {
  if (newInstance || !instance) {
    instance = axios.create({
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "x-app-version": getAppVersion(),
        "x-session-id": getOrSetSessionId()
      },
      withCredentials: true,
      validateStatus: status => [200, 201, 202, 204].includes(status),
      paramsSerializer: (params: QueryParams) => buildQueryParams(params)
    });
  }
  return instance;
};

export default apiClient;
