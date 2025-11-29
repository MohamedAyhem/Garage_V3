import reservationModel from "../models/reservationModel.js";
import garageModel from "../models/garage.js";
import mechanicModel from "../models/mechanic.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

const listgaragereservations = async (req, res) => {
  try {
    const { garageId } = req.body;
    const clerkUserId = req.user?.id;

    if (!garageId) {
      return res.status(400).json({
        success: false,
        message: "Garage ID is required",
      });
    }

    const garage = await garageModel.findOne({
      _id: garageId,
      Ownedby: clerkUserId,
    });

    if (!garage) {
      return res.status(403).json({
        success: false,
        message: "You don't own this garage or garage doesn't exist",
      });
    }

    const allreservations = await reservationModel
      .find({
        garageId: garageId,
      })
      .populate("userId", "name email phone")
      .populate("serviceId", "name price duration")
      .populate("carId", "model brand year licensePlate")
      .populate("mechanicId", "name email") // ← FIXED
      .sort({ reservationDate: 1 });

    res.status(200).json({
      success: true,
      reservations: allreservations,
      count: allreservations.length,
    });
  } catch (error) {
    console.error("Error fetching garage reservations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const clerkUserId = req.user?.id;
    const { garageId } = req.query; // Get garageId from query params

    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no user found",
      });
    }

    const garages = await garageModel.find({ Ownedby: clerkUserId });

    if (!garages.length) {
      return res.status(200).json({
        success: true,
        reservations: [],
        message: "This owner has no garages",
      });
    }

    // If garageId is provided, filter by that specific garage
    let garageIds;
    if (garageId) {
      // Verify the garage belongs to the user
      const selectedGarage = garages.find((g) => g._id.toString() === garageId);
      if (!selectedGarage) {
        return res.status(403).json({
          success: false,
          message: "You don't own this garage",
        });
      }
      garageIds = [selectedGarage._id];
    } else {
      // If no specific garage selected, show all
      garageIds = garages.map((g) => g._id);
    }

    const mechanics = await mechanicModel
      .find({
        ownedBy: clerkUserId,
        garageId: garageIds[0] || { $exists: true },
      })
      .select("name _id garageId");

    const reservations = await reservationModel
      .find({ garageId: { $in: garageIds } })
      .populate("garageId")
      .populate("serviceId")
      .populate("carId")
      .populate("mechanicId", "name email")
      .lean();

    const enrichedReservations = await Promise.all(
      reservations.map(async (r) => {
        try {
          const user = await clerkClient.users.getUser(r.userId);

          return {
            ...r,
            customerName: `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim(),
            customerEmail: user.emailAddresses?.[0]?.emailAddress || "",
          };
        } catch (err) {
          console.error("Failed fetching Clerk user:", err);
          return { ...r, customerName: "Unknown Customer" };
        }
      })
    );

    return res.status(200).json({
      success: true,
      totalReservations: enrichedReservations.length,
      reservations: enrichedReservations,
      count: enrichedReservations.length,
      mechanics,
    });
  } catch (err) {
    console.error("Error fetching reservations:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reservations",
      error: err.message,
    });
  }
};

const getAllClients = async (req, res) => {
  try {
    const clerkUserId = req.user?.id;

    // Get all garages owned by this owner
    const garages = await garageModel.find({ Ownedby: clerkUserId });

    if (!garages.length) {
      return res.status(200).json({
        success: true,
        clients: [],
        message: "No garages found for this user",
      });
    }

    const garageIds = garages.map((g) => g._id);

    // Get ALL reservations for these garages
    const reservations = await reservationModel.find({
      garageId: { $in: garageIds },
    });

    if (!reservations.length) {
      return res.status(200).json({
        success: true,
        clients: [],
        message: "No clients found",
      });
    }

    // Group reservation count and phone per user
    const clientMap = {};
    reservations.forEach((r) => {
      const uid = r.userId.toString();
      if (!clientMap[uid]) {
        clientMap[uid] = {
          count: 0,
          phone: r.tel || "", // Get phone from reservation
        };
      }
      clientMap[uid].count++;
      // Update phone if found in latest reservation
      if (r.tel && !clientMap[uid].phone) {
        clientMap[uid].phone = r.tel;
      }
    });

    // Get unique userIds
    const uniqueUserIds = Object.keys(clientMap);

    // Fetch client details from Clerk
    const clients = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const user = await clerkClient.users.getUser(userId);

          // Get phone from phoneNumbers, metadata, or from reservations
          let phone = clientMap[userId].phone;
          if (!phone && user.phoneNumbers && user.phoneNumbers.length > 0) {
            phone = user.phoneNumbers[0].phoneNumber || "";
          }

          // Try to get from unsafeMetadata or publicMetadata if not already found
          if (!phone && user.unsafeMetadata?.phone) {
            phone = user.unsafeMetadata.phone;
          }
          if (!phone && user.publicMetadata?.phone) {
            phone = user.publicMetadata.phone;
          }

          return {
            userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.emailAddresses?.[0]?.emailAddress || "",
            phone: phone || "",
            totalReservations: clientMap[userId].count,
          };
        } catch (error) {
          console.log("Failed fetching clerk user:", error);
          return {
            userId,
            name: "Unknown",
            email: "",
            phone: clientMap[userId].phone || "",
            totalReservations: clientMap[userId].count,
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const { reservationId, mechanicId, status } = req.body;
    const clerkUserId = req.user?.id;

    if (!reservationId) {
      return res.status(400).json({
        success: false,
        message: "Reservation ID is required",
      });
    }

    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const garage = await garageModel.findOne({
      _id: reservation.garageId,
      Ownedby: clerkUserId,
    });

    if (!garage) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this reservation",
      });
    }

    if (mechanicId) {
      const mechanic = await mechanicModel.findOne({
        _id: mechanicId,
        ownedBy: clerkUserId,
      });

      if (!mechanic) {
        return res.status(403).json({
          success: false,
          message: "Mechanic not found or doesn't belong to you",
        });
      }
    }

    const updateData = {};

    // VALIDATION: Check if trying to mark as completed without a mechanic
    if (status) {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === "completed") {
        // Check if mechanic will be assigned OR is already assigned
        const futureAssignedMechanicId = mechanicId || reservation.mechanicId;
        if (!futureAssignedMechanicId) {
          console.log(`[ERROR] Attempted to mark completed without mechanic`);
          return res.status(400).json({
            success: false,
            message:
              "Please assign a mechanic before marking a reservation as completed",
          });
        }
      }
    }

    // ONLY handle mechanic assignment if it changed
    if (mechanicId && mechanicId !== reservation.mechanicId?.toString()) {
      console.log(
        `[ASSIGN] Assigning mechanic ${mechanicId} to reservation ${reservationId}`
      );
      updateData.mechanicId = mechanicId;

      // Increment NEW mechanic's tasksAssigned
      await mechanicModel.findByIdAndUpdate(
        mechanicId,
        { $inc: { tasksAssigned: 1 } },
        { new: true }
      );

      // Decrement OLD mechanic's tasksAssigned (but don't go below 0)
      if (reservation.mechanicId) {
        const oldMechanic = await mechanicModel.findById(
          reservation.mechanicId
        );
        if (oldMechanic) {
          const newCount = Math.max(oldMechanic.tasksAssigned - 1, 0);
          await mechanicModel.findByIdAndUpdate(reservation.mechanicId, {
            tasksAssigned: newCount,
          });
          console.log(
            `[REASSIGN] Old mechanic now has tasksAssigned=${newCount}`
          );
        }
      }
    }

    // Handle status changes and update mechanic task counts accordingly
    if (status) {
      const normalizedNewStatus = status.toLowerCase();
      const normalizedOldStatus = reservation.status?.toLowerCase();
      const hasStatusChanged = normalizedNewStatus !== normalizedOldStatus;

      if (hasStatusChanged) {
        const assignedMechanicId = mechanicId || reservation.mechanicId;

        // Case 1: Changing FROM any status TO "completed"
        if (
          normalizedNewStatus === "completed" &&
          normalizedOldStatus !== "completed"
        ) {
          console.log(
            `[STATUS] Changing from ${normalizedOldStatus} to completed for mechanic ${assignedMechanicId}`
          );
          if (assignedMechanicId) {
            const mechanic = await mechanicModel.findById(assignedMechanicId);
            if (mechanic) {
              const newAssigned = Math.max(mechanic.tasksAssigned - 1, 0);
              await mechanicModel.findByIdAndUpdate(assignedMechanicId, {
                tasksAssigned: newAssigned,
                tasksCompleted: mechanic.tasksCompleted + 1,
              });
              console.log(
                `[COMPLETE] Mechanic now has tasksAssigned=${newAssigned}, tasksCompleted=${
                  mechanic.tasksCompleted + 1
                }`
              );
            }
          }
        }
        // Case 2: Changing FROM "completed" TO any other status
        else if (
          normalizedOldStatus === "completed" &&
          normalizedNewStatus !== "completed"
        ) {
          console.log(
            `[STATUS] Changing from completed back to ${normalizedNewStatus} for mechanic ${assignedMechanicId}`
          );
          if (assignedMechanicId) {
            const mechanic = await mechanicModel.findById(assignedMechanicId);
            if (mechanic) {
              // Move task back from completed to assigned
              await mechanicModel.findByIdAndUpdate(assignedMechanicId, {
                tasksAssigned: mechanic.tasksAssigned + 1,
                tasksCompleted: Math.max(mechanic.tasksCompleted - 1, 0),
              });
              console.log(
                `[INCOMPLETE] Mechanic now has tasksAssigned=${
                  mechanic.tasksAssigned + 1
                }, tasksCompleted=${Math.max(mechanic.tasksCompleted - 1, 0)}`
              );
            }
          }
        }
        // Case 3: Status changed but neither from nor to "completed" - no mechanic count change needed
        else {
          console.log(
            `[STATUS] Status changed from ${normalizedOldStatus} to ${normalizedNewStatus}, no mechanic counts affected`
          );
        }
      }

      updateData.status = status;
    }

    const updated = await reservationModel
      .findByIdAndUpdate(reservationId, updateData, { new: true })
      .populate("mechanicId", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      reservation: updated,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const declineReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;
    const clerkUserId = req.user?.id;

    if (!reservationId) {
      return res.status(400).json({
        success: false,
        message: "Reservation ID is required",
      });
    }

    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const garage = await garageModel.findOne({
      _id: reservation.garageId,
      Ownedby: clerkUserId,
    });

    if (!garage) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to decline this reservation",
      });
    }

    // If a mechanic was assigned, decrement their tasksAssigned count
    if (reservation.mechanicId) {
      await mechanicModel.findByIdAndUpdate(reservation.mechanicId, {
        $inc: { tasksAssigned: -1 },
      });
    }

    const result = await reservationModel.deleteOne({
      _id: reservationId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation declined successfully",
    });
  } catch (error) {
    console.error("Error declining reservation:", error);
    res.status(500).json({
      success: false,
      message: "Could not decline the reservation",
    });
  }
};

export {
  listgaragereservations,
  getAllReservations,
  getAllClients,
  declineReservation,
  updateReservation,
};
