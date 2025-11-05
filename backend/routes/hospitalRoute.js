import express from "express";
import {
  getAllHospitals,
  getHospitalById,
  addHospital,
  updateHospital,
  deleteHospital,
  addHospitalReview,
  getHospitalsBySpecialty,
  getNearbyHospitals,
  getHospitalPhotos
} from "../controllers/hospitalController.js";
import authAdmin from "../middlewares/authAdmin.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const hospitalRouter = express.Router();

// Public routes
hospitalRouter.get("/list", getAllHospitals);
hospitalRouter.get("/nearby", getNearbyHospitals);
hospitalRouter.get("/photos", getHospitalPhotos);
hospitalRouter.get("/specialty/:specialty", getHospitalsBySpecialty);
hospitalRouter.get("/:id", getHospitalById);

// User routes (requires authentication)
hospitalRouter.post("/:id/review", authUser, addHospitalReview);

// Admin routes (requires admin authentication)
hospitalRouter.post("/add", authAdmin, upload.array("images", 10), addHospital);
hospitalRouter.put("/:id", authAdmin, upload.array("images", 10), updateHospital);
hospitalRouter.delete("/:id", authAdmin, deleteHospital);

export default hospitalRouter;