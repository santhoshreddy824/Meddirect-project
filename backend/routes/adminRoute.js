import express from "express";
import {
  addDoctor,
  allDoctors,
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  listLoginEvents,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
// Support both GET and POST; also add a universal handler to reduce 404 risk in some hosting rewrites
adminRouter.get("/login-events", authAdmin, listLoginEvents);
adminRouter.post("/login-events", authAdmin, listLoginEvents);
adminRouter.all("/login-events", authAdmin, (req, res) => {
  // If method not explicitly handled, still attempt listing for robustness
  return listLoginEvents(req, res);
});

// Debug route to introspect admin router in deployed environments (optional; can be removed in production hardened build)
adminRouter.get("/_routes", authAdmin, (req, res) => {
  try {
    const routes = [];
    adminRouter.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(",");
        routes.push({ path: layer.route.path, methods });
      }
    });
    res.json({ success: true, routes });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

export default adminRouter;
