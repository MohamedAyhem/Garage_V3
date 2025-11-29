import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    const protectedRoutes = [
      "/api/cars/user/",
      "/api/cars/addCar",
      "/api/cars/default/",
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
      config.url?.includes(route)
    );

    const isDeletingCar =
      config.method === "delete" && config.url?.includes("/api/cars/");

    if ((isProtectedRoute || isDeletingCar) && !authToken) {
      throw new Error("No authentication token provided");
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const carApiService = {
  async getBrands() {
    try {
      const response = await apiClient.get("/api/cars/brands");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Brand fetch error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  },

  async getModelsByBrand(brandId) {
    try {
      const response = await apiClient.get(`/api/cars/models/${brandId}`);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Models fetch error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch models"
      );
    }
  },

  async getYearsForModel(modelId) {
    try {
      const response = await apiClient.get(`/api/cars/years/${modelId}`);
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Years fetch error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch years");
    }
  },

  async verifyVIN(vin) {
    try {
      const response = await apiClient.get(`/api/cars/vin/${vin}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to verify VIN");
    }
  },

  async lookupLicensePlate(licensePlate, countryCode = "US", region = null) {
    try {
      const params = new URLSearchParams({ country: countryCode });
      if (region) params.append("region", region);

      const response = await apiClient.get(
        `/api/cars/plate/${licensePlate}?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to lookup license plate"
      );
    }
  },

  async getUserVehicles() {
    try {
      const response = await apiClient.get("/api/cars/user/cars");
      return response.data.cars;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user vehicles"
      );
    }
  },

  async saveVehicle(vehicleData) {
    try {
      const backendData = {
        brand: vehicleData.brand,
        model: vehicleData.model,
        plate: vehicleData.licensePlate,
        year: parseInt(vehicleData.year),
        mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : 0,
        vin: vehicleData.vin || null,
      };

      const response = await apiClient.post("/api/cars/addCar", backendData);
      return response.data.car;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to save vehicle"
      );
    }
  },

  async setDefaultVehicle(carId) {
    try {
      const response = await apiClient.put(`/api/cars/default/${carId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to set default vehicle"
      );
    }
  },

  async deleteVehicle(carId) {
    try {
      const response = await apiClient.delete(`/api/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete vehicle"
      );
    }
  },
};
