import React from "react";
import GarageCardItem from "../Components/GarageCardItem";
import GarageForm from "../Components/GarageForm";
import CreateServiceModal from "../Components/CreateServiceModal";
import ServicesPopup from "../Components/ServicesPopup";

const MyGaragesView = (props) => {
  const {
    page,
    setPage,
    garages,
    loading,
    modalOpen,
    setModalOpen,
    editModalOpen,
    setEditModalOpen,
    editingGarage,
    services,
    showServiceModal,
    setShowServiceModal,
    openMenuId,
    setOpenMenuId,
    servicesPopupOpen,
    setServicesPopupOpen,
    serviceDropdownOpen,
    setServiceDropdownOpen,
    name,
    setName,
    location,
    setLocation,
    coordinates,
    getCurrentLocation,
    locationLoading,
    description,
    setDescription,
    capacity,
    setCapacity,
    open,
    setOpen,
    close,
    setClose,
    images,
    setImages,
    selectedServices,
    toggleService,
    serviceSearchTerm,
    setServiceSearchTerm,
    isSubmitting,
    newServiceName,
    setNewServiceName,
    newServiceDescription,
    setNewServiceDescription,
    newServiceImages,
    setNewServiceImages,
    handleCreateService,
    handleCreateGarage,
    handleUpdateGarage,
    handleDeleteGarage,
    resetForm,
    totalPages,
    paginatedData,
  } = props;

  if (loading) {
    return (
      <div className="p-6 text-center text-xl font-semibold text-black">
        Loading garages...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Garages</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          + Add Garage
        </button>
      </div>

      {garages.length === 0 ? (
        <p className="text-black text-lg font-semibold">No garages found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedData.map((garage) => (
              <GarageCardItem
                key={garage._id}
                garage={garage}
                openMenuId={openMenuId}
                onMenuClick={setOpenMenuId}
                onEdit={props.openEditModal}
                onDelete={handleDeleteGarage}
                onViewAllServices={setServicesPopupOpen}
                onServicesClick={setServicesPopupOpen}
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-40"
            >
              Prev
            </button>

            <span className="font-semibold text-black">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto">
          <GarageForm
            title="Add New Garage"
            name={name}
            setName={setName}
            location={location}
            setLocation={setLocation}
            coordinates={coordinates}
            getCurrentLocation={getCurrentLocation}
            locationLoading={locationLoading}
            description={description}
            setDescription={setDescription}
            capacity={capacity}
            setCapacity={setCapacity}
            open={open}
            setOpen={setOpen}
            close={close}
            setClose={setClose}
            images={images}
            setImages={setImages}
            services={services}
            selectedServices={selectedServices}
            toggleService={toggleService}
            serviceSearchTerm={serviceSearchTerm}
            setServiceSearchTerm={setServiceSearchTerm}
            serviceDropdownOpen={serviceDropdownOpen}
            setServiceDropdownOpen={setServiceDropdownOpen}
            onCreateService={() => setShowServiceModal(true)}
            onSubmit={handleCreateGarage}
            onCancel={() => {
              setModalOpen(false);
              resetForm();
            }}
            isSubmitting={isSubmitting}
            isEditMode={false}
          />
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto">
          <GarageForm
            title="Edit Garage"
            name={name}
            setName={setName}
            location={location}
            setLocation={setLocation}
            coordinates={coordinates}
            getCurrentLocation={getCurrentLocation}
            locationLoading={locationLoading}
            description={description}
            setDescription={setDescription}
            capacity={capacity}
            setCapacity={setCapacity}
            open={open}
            setOpen={setOpen}
            close={close}
            setClose={setClose}
            images={images}
            setImages={setImages}
            services={services}
            selectedServices={selectedServices}
            toggleService={toggleService}
            serviceSearchTerm={serviceSearchTerm}
            setServiceSearchTerm={setServiceSearchTerm}
            serviceDropdownOpen={serviceDropdownOpen}
            setServiceDropdownOpen={setServiceDropdownOpen}
            onCreateService={() => setShowServiceModal(true)}
            onSubmit={handleUpdateGarage}
            onCancel={() => {
              setEditModalOpen(false);
              resetForm();
            }}
            isSubmitting={isSubmitting}
            isEditMode={true}
          />
        </div>
      )}

      <CreateServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setNewServiceName("");
          setNewServiceDescription("");
          setNewServiceImages([]);
        }}
        newServiceName={newServiceName}
        setNewServiceName={setNewServiceName}
        newServiceDescription={newServiceDescription}
        setNewServiceDescription={setNewServiceDescription}
        newServiceImages={newServiceImages}
        setNewServiceImages={setNewServiceImages}
        onSubmit={handleCreateService}
      />

      <ServicesPopup
        isOpen={!!servicesPopupOpen}
        onClose={() => setServicesPopupOpen(null)}
        garage={servicesPopupOpen}
        garages={garages}
      />
    </div>
  );
};

export default MyGaragesView;
