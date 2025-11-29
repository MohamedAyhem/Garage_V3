export const validateVehicleForm = (data) => {
  const errors = {};

  if (!data.brandName?.trim()) {
    errors.brand = "Brand is required";
  }

  if (!data.modelName?.trim()) {
    errors.model = "Model is required";
  }

  const currentYear = new Date().getFullYear();
  if (!data.year) {
    errors.year = "Year is required";
  } else if (data.year < 1900 || data.year > currentYear + 1) {
    errors.year = `Year must be between 1900 and ${currentYear + 1}`;
  }

  if (!data.licensePlate?.trim()) {
    errors.licensePlate = "License plate is required";
  }

  if (data.mileage) {
    if (data.mileage < 0) {
      errors.mileage = "Mileage cannot be negative";
    } else if (data.mileage > 1000000) {
      errors.mileage = "Mileage seems too high";
    }
  }

  if (data.vin && data.vin.length !== 17) {
    errors.vin = "VIN must be 17 characters";
  }

  return errors;
};
