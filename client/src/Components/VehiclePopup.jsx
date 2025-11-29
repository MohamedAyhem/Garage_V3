import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { validateVehicleForm } from "../utils/vehicleValidation";
import { carApiService, setAuthToken } from "../utils/apiService";

const VehiclePopup = ({ isOpen, onClose, onVehicleAdd }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    brand: "",
    brandName: "",
    model: "",
    modelName: "",
    year: "",
    licensePlate: "",
    vin: "",
    mileage: "",
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsData = await carApiService.getBrands();
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        console.error("Failed to load brands:", error);
        setBrands([]);
      }
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      if (formData.brand) {
        try {
          const modelsData = await carApiService.getModelsByBrand(
            formData.brand
          );
          setModels(Array.isArray(modelsData) ? modelsData : []);
        } catch (error) {
          console.error("Failed to load models:", error);
          setModels([]);
        }
      } else {
        setModels([]);
      }
    };
    loadModels();
  }, [formData.brand]);

  useEffect(() => {
    const loadYears = async () => {
      if (formData.model) {
        try {
          const yearsData = await carApiService.getYearsForModel(
            formData.model
          );
          setYears(Array.isArray(yearsData) ? yearsData : []);
        } catch (error) {
          console.error("Failed to load years:", error);
          setYears([]);
        }
      } else {
        setYears([]);
      }
    };
    loadYears();
  }, [formData.model]);
  useEffect(() => {
    if (formData.vin && formData.brandName) {
      validateVINWithAPI(formData.vin);
    }
  }, [formData.brandName]);

  useEffect(() => {
    if (formData.vin && formData.modelName) {
      validateVINWithAPI(formData.vin);
    }
  }, [formData.modelName]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateVehicleForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = await getToken();
      setAuthToken(token);
      const vehicleToSave = {
        brand: formData.brandName,
        model: formData.modelName,
        year: formData.year,
        licensePlate: formData.licensePlate,
        vin: formData.vin,
        mileage: formData.mileage,
      };

      const savedVehicle = await carApiService.saveVehicle(vehicleToSave);

      if (onVehicleAdd) {
        onVehicleAdd(savedVehicle);
      }

      window.dispatchEvent(
        new CustomEvent("vehicleAdded", {
          detail: { vehicle: savedVehicle },
        })
      );

      setFormData({
        brand: "",
        brandName: "",
        model: "",
        modelName: "",
        year: "",
        licensePlate: "",
        vin: "",
        mileage: "",
      });

      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.duplicate) {
      setErrors((prev) => ({ ...prev, duplicate: "" }));
    }

    if (name === "brand") {
      const brandId = parseInt(value, 10);
      const selectedBrand = Array.isArray(brands)
        ? brands.find((b) => b.id === brandId)
        : null;
      console.log("Selected brand:", selectedBrand);
      setFormData((prev) => ({
        ...prev,
        brand: value,
        brandName: selectedBrand?.name || "",
        model: "",
        modelName: "",
        year: "",
      }));
      return;
    }

    if (name === "model") {
      const modelId = parseInt(value, 10);
      const selectedModel = Array.isArray(models)
        ? models.find((m) => m.id === modelId)
        : null;
      console.log("Selected model:", selectedModel);
      setFormData((prev) => ({
        ...prev,
        model: value,
        modelName: selectedModel?.name || "",
        year: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateVINWithAPI = async (vin) => {
    if (!vin) {
      setErrors((prev) => ({ ...prev, vin: "" }));
      return;
    }

    if (vin.length !== 17) {
      setErrors((prev) => ({ ...prev, vin: "VIN must be 17 characters" }));
      return;
    }

    try {
      const vinData = await carApiService.verifyVIN(vin);
      if (vinData) {
        const vinMake = vinData.make?.toUpperCase() || "";
        const vinModel = vinData.model?.toUpperCase() || "";
        const selectedBrand = formData.brandName?.toUpperCase() || "";
        const selectedModel = formData.modelName?.toUpperCase() || "";

        console.log("VIN Data:", {
          vinMake,
          vinModel,
          selectedBrand,
          selectedModel,
        });

        const isModelMasked =
          vinModel.includes("***") ||
          vinModel.includes("LIMITED") ||
          vinModel.includes("SUBSCRIBE") ||
          vinModel === "";

        if (vinMake && selectedBrand) {
          const makeMatches =
            vinMake === selectedBrand ||
            selectedBrand.includes(vinMake) ||
            vinMake.includes(selectedBrand);

          if (!makeMatches) {
            setErrors((prev) => ({
              ...prev,
              vin: `VIN brand mismatch. VIN is for: ${vinMake} but you selected: ${selectedBrand}`,
            }));
            return;
          }
        }

        if (!isModelMasked && vinModel && selectedModel) {
          const modelMatches =
            vinModel.includes(selectedModel) ||
            selectedModel.includes(vinModel);

          if (!modelMatches) {
            setErrors((prev) => ({
              ...prev,
              vin: `VIN model mismatch. VIN is for: ${vinMake} ${vinModel} but you selected: ${selectedModel}`,
            }));
            return;
          }
        }
        setErrors((prev) => ({ ...prev, vin: "" }));
        console.log("VIN validation passed - brand matches");
      }
    } catch (error) {
      console.error("VIN validation error:", error);
      setErrors((prev) => ({
        ...prev,
        vin: "VIN is invalid or not found in database",
      }));
    }
  };

  const validateLicensePlateFormat = (plate) => {
    if (!plate) {
      setErrors((prev) => ({ ...prev, licensePlate: "" }));
      return;
    }

    if (plate.length < 2) {
      setErrors((prev) => ({
        ...prev,
        licensePlate: "License plate must be at least 2 characters",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, licensePlate: "" }));
  };

  const handleVINBlur = () => {
    if (formData.vin) {
      validateVINWithAPI(formData.vin);
    }
  };

  const handlePlateBlur = () => {
    if (formData.licensePlate) {
      validateLicensePlateFormat(formData.licensePlate);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="mt-110 bg-black/15 z-50" onClick={handleOverlayClick} />
      <div className="fixed inset-0 flex backdrop-blur-[1px] items-center justify-center z-50">
        <div className="bg-[#1A1A1A] p-8 rounded-xl shadow-2xl max-w-md w-full border border-[#FFDE01] transform transition-all duration-300 ease-out relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div className="relative">
            <h2 className="text-2xl font-bold mb-2 text-[#FFDE01] tracking-wide pr-8">
              Add New Vehicle
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Please provide your vehicle details
            </p>

            {errors.duplicate && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{errors.duplicate}</p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4">
                {/* VIN Field */}
                <div>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    onBlur={handleVINBlur}
                    placeholder="VIN (17 characters) *"
                    maxLength="17"
                    className={`w-full bg-[#1A1A1A] border ${
                      errors.vin ? "border-red-500" : "border-[#FFDE01]/20"
                    } text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE01] hover:border-[#FFDE01]/40 transition-colors`}
                  />
                  {errors.vin && (
                    <p className="text-red-400 text-xs mt-1">{errors.vin}</p>
                  )}
                </div>

                {/* License Plate Field */}
                <div>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    onBlur={handlePlateBlur}
                    placeholder="License Plate *"
                    className={`w-full bg-[#1A1A1A] border ${
                      errors.licensePlate
                        ? "border-red-500"
                        : "border-[#FFDE01]/20"
                    } text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE01] hover:border-[#FFDE01]/40 transition-colors`}
                  />
                  {errors.licensePlate && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.licensePlate}
                    </p>
                  )}
                </div>

                {/* Brand Select */}
                <div>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`w-full bg-[#1A1A1A] border ${
                      errors.brand ? "border-red-500" : "border-[#FFDE01]/20"
                    } text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE01] hover:border-[#FFDE01]/40 transition-colors`}
                  >
                    <option value="">Select Brand *</option>
                    {Array.isArray(brands) &&
                      brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                  </select>
                  {errors.brand && (
                    <p className="text-red-400 text-xs mt-1">{errors.brand}</p>
                  )}
                </div>

                {/* Model Select */}
                <div>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    disabled={!formData.brand}
                    className={`w-full bg-[#1A1A1A] border ${
                      errors.model ? "border-red-500" : "border-[#FFDE01]/20"
                    } text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE01] hover:border-[#FFDE01]/40 transition-colors`}
                  >
                    <option value="">Select Model *</option>
                    {Array.isArray(models) &&
                      models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                  </select>
                  {errors.model && (
                    <p className="text-red-400 text-xs mt-1">{errors.model}</p>
                  )}
                </div>

                {/* Year Select */}
                <div>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={!formData.model}
                    className={`w-full bg-[#1A1A1A] border ${
                      errors.year ? "border-red-500" : "border-[#FFDE01]/20"
                    } text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE01] hover:border-[#FFDE01]/40 transition-colors`}
                  >
                    <option value="">Select Year *</option>
                    {Array.isArray(years) &&
                      years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                  {errors.year && (
                    <p className="text-red-400 text-xs mt-1">{errors.year}</p>
                  )}
                </div>

                {/* Mileage Field */}
                <div>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    placeholder="Mileage in km *"
                    min="0"
                    className={`w-full bg-[#1A1A1A] border ${
                      errors.mileage ? "border-red-500" : "border-[#FFDE01]/20"
                    } text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFDE01] hover:border-[#FFDE01]/40 transition-colors`}
                  />
                  {errors.mileage && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.mileage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FFDE01] hover:bg-[#FFDE01]/90 text-black font-bold px-6 py-3 rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-black"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Adding Vehicle...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-car"></i>
                      <span>Add Vehicle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehiclePopup;
