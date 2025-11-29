import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CAR_API_BASE_URL = "https://carapi.app/api";
const CAR_API_TOKEN = process.env.CAR_API_TOKEN;
const CAR_API_SECRET = process.env.CAR_API_SECRET;

let carApiJwtToken = null;
let tokenExpiry = null;

const carApiClient = axios.create({
  baseURL: CAR_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const loginToCarApi = async () => {
  try {
    const response = await carApiClient.post(
      "/auth/login",
      {
        api_token: CAR_API_TOKEN,
        api_secret: CAR_API_SECRET,
      },
      {
        headers: { Accept: "text/plain" },
      }
    );

    if (!response.data) {
      throw new Error("No response from authentication");
    }

    carApiJwtToken = response.data;
    tokenExpiry = Date.now() + 60 * 60 * 1000;

    return carApiJwtToken;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed");
    }
    throw new Error(
      `Auth failed: ${error.response?.data?.message || error.message}`
    );
  }
};

const isTokenExpired = () => !carApiJwtToken || Date.now() >= tokenExpiry;

const ensureCarApiAuthenticated = async () => {
  if (isTokenExpired()) {
    await loginToCarApi();
  }
  return carApiJwtToken;
};

const handleApiRequest = async (method, endpoint, retryOnAuth = true) => {
  try {
    const token = await ensureCarApiAuthenticated();
    const response = await carApiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && retryOnAuth) {
      carApiJwtToken = null;
      tokenExpiry = null;
      return handleApiRequest(method, endpoint, false);
    }

    if (error.response) {
      throw new Error(
        `API Error: ${
          error.response.data?.message || JSON.stringify(error.response.data)
        }`
      );
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
};

export const carApiService = {
  async getBrands() {
    const response = await handleApiRequest("get", "/makes");
    return response?.data || response || [];
  },

  async getModelsByBrand(brandId) {
    const response = await handleApiRequest(
      "get",
      `/models/v2?make_id=${brandId}`
    );
    return response?.data || response || [];
  },

  async getYearsForModel(modelId) {
    const response = await handleApiRequest(
      "get",
      `/years/v2?model_id=${modelId}`
    );
    const data = response?.data || response || [];

    if (Array.isArray(data)) {
      return [...new Set(data)].sort((a, b) => b - a);
    }

    throw new Error("Invalid response format: expected array of years");
  },

  async verifyVIN(vin) {
    return handleApiRequest("get", `/vin/${vin}`);
  },

  async lookupLicensePlate(licensePlate, countryCode = "US", region = null) {
    try {
      const token = await ensureCarApiAuthenticated();
      const params = new URLSearchParams({
        country_code: countryCode,
        lookup: licensePlate,
      });

      if (region) {
        params.append("region", region);
      }

      const response = await carApiClient.get(
        `/license-plate?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        carApiJwtToken = null;
        tokenExpiry = null;
        return this.lookupLicensePlate(licensePlate, countryCode, region);
      }

      if (error.response) {
        throw new Error(
          `API Error: ${
            error.response.data?.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        throw new Error("No response from server");
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  },
};

export default carApiService;
