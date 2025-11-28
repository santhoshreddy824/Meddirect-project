import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorModel.js";
import { v2 as cloudinary } from "cloudinary";
import fetch from "node-fetch";

// Get all hospitals with optional filtering
const getAllHospitals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      specialty,
      type,
      rating,
      lat,
      lng,
      radius = 10, // kilometers
      sortBy = "name"
    } = req.query;

    const filter = { status: "active" };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Filter by specialty
    if (specialty) {
      filter["specialties.name"] = { $regex: specialty, $options: "i" };
    }

    // Filter by hospital type
    if (type) {
      filter.type = type;
    }

    // Filter by minimum rating
    if (rating) {
      filter["ratings.overall"] = { $gte: parseFloat(rating) };
    }

    let query = hospitalModel.find(filter);

    // Location-based search
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseFloat(radius) * 1000;

      query = hospitalModel.find({
        ...filter,
        "address.coordinates": {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: radiusInMeters
          }
        }
      });
    }

    // Sorting
    const sortOptions = {
      name: { name: 1 },
      rating: { "ratings.overall": -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    if (sortOptions[sortBy]) {
      query = query.sort(sortOptions[sortBy]);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const hospitals = await query
      .skip(skip)
      .limit(parseInt(limit))
      .populate("doctors.doctorId", "name specialization experience image")
      .lean();

    // Add distance for each hospital if location provided
    if (lat && lng) {
      hospitals.forEach(hospital => {
        hospital.distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          hospital.address.coordinates.latitude,
          hospital.address.coordinates.longitude
        );
      });
    }

    // Get total count for pagination
    const total = await hospitalModel.countDocuments(filter);

    res.json({
      success: true,
      hospitals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospitals"
    });
  }
};

// Get hospital by ID
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hospital = await hospitalModel
      .findById(id)
      .populate("doctors.doctorId", "name specialization experience image available")
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.json({
      success: true,
      hospital
    });
  } catch (error) {
    console.error("Error fetching hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospital details"
    });
  }
};

// Add new hospital (Admin only)
const addHospital = async (req, res) => {
  try {
    const hospitalData = req.body;

    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      const imageUploads = [];
      
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "hospitals",
            resource_type: "image"
          });
          imageUploads.push({
            url: result.secure_url,
            description: file.originalname,
            isMain: imageUploads.length === 0 // First image is main
          });
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }
      
      hospitalData.images = imageUploads;
    }

    const newHospital = new hospitalModel(hospitalData);
    await newHospital.save();

    res.status(201).json({
      success: true,
      message: "Hospital added successfully",
      hospital: newHospital
    });
  } catch (error) {
    console.error("Error adding hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error adding hospital",
      error: error.message
    });
  }
};

// Update hospital (Admin only)
const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const hospital = await hospitalModel.findById(id);
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found"
        });
      }

      const newImages = [];
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "hospitals",
            resource_type: "image"
          });
          newImages.push({
            url: result.secure_url,
            description: file.originalname,
            isMain: false
          });
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }
      
      // Add new images to existing ones
      updateData.images = [...(hospital.images || []), ...newImages];
    }

    const updatedHospital = await hospitalModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedHospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.json({
      success: true,
      message: "Hospital updated successfully",
      hospital: updatedHospital
    });
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error updating hospital",
      error: error.message
    });
  }
};

// Delete hospital (Admin only)
const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await hospitalModel.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    // Delete images from cloudinary
    if (hospital.images && hospital.images.length > 0) {
      for (const image of hospital.images) {
        try {
          const publicId = image.url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`hospitals/${publicId}`);
        } catch (deleteError) {
          console.error("Error deleting image:", deleteError);
        }
      }
    }

    await hospitalModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Hospital deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting hospital"
    });
  }
};

// Add review to hospital
const addHospitalReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, department, visitDate } = req.body;
    const userId = req.userId; // From auth middleware
    const userName = req.userName; // From auth middleware

    const hospital = await hospitalModel.findById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    // Check if user already reviewed this hospital
    const existingReview = hospital.reviews.find(
      review => review.userId?.toString() === userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this hospital"
      });
    }

    const newReview = {
      userId,
      userName,
      rating: parseInt(rating),
      comment,
      department,
      visitDate: visitDate ? new Date(visitDate) : new Date(),
      reviewDate: new Date()
    };

    hospital.reviews.push(newReview);
    hospital.updateRatings();
    await hospital.save();

    res.json({
      success: true,
      message: "Review added successfully",
      review: newReview
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Error adding review"
    });
  }
};

// Get hospitals by specialty
const getHospitalsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const { lat, lng, radius = 10 } = req.query;

    let query = {
      status: "active",
      "specialties.name": { $regex: specialty, $options: "i" }
    };

    let hospitals;

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseFloat(radius) * 1000;

      hospitals = await hospitalModel.find({
        ...query,
        "address.coordinates": {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: radiusInMeters
          }
        }
      }).populate("doctors.doctorId", "name specialization experience").lean();

      // Add distance
      hospitals.forEach(hospital => {
        hospital.distance = calculateDistance(
          latitude,
          longitude,
          hospital.address.coordinates.latitude,
          hospital.address.coordinates.longitude
        );
      });
    } else {
      hospitals = await hospitalModel
        .find(query)
        .populate("doctors.doctorId", "name specialization experience")
        .sort({ "ratings.overall": -1 })
        .lean();
    }

    res.json({
      success: true,
      hospitals,
      count: hospitals.length
    });
  } catch (error) {
    console.error("Error fetching hospitals by specialty:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hospitals"
    });
  }
};

// Get nearby hospitals
const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000; // radius is expected in km

    // First try a GeoJSON $near query on a GeoJSON field if present
    let hospitals = [];
    try {
      hospitals = await hospitalModel.find({
        status: "active",
        // try GeoJSON field first (address.location expected as { type: 'Point', coordinates: [lng, lat] })
        "address.location": {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: radiusInMeters
          }
        }
      }).limit(50).lean();
    } catch (geoErr) {
      // If GeoJSON query fails (no index or field), we'll fall back below
      hospitals = [];
    }

    // If GeoJSON query returned no results, fall back to scanning documents and calculating distance
    if (!hospitals || hospitals.length === 0) {
      const allActive = await hospitalModel.find({ status: "active" }).lean();
      hospitals = allActive
        .map(hospital => {
          const coord = hospital.address && hospital.address.coordinates;
          if (!coord || coord.latitude == null || coord.longitude == null) return null;
          const dist = calculateDistance(latitude, longitude, coord.latitude, coord.longitude);
          return { ...hospital, distance: dist };
        })
        .filter(Boolean)
        .filter(h => h.distance <= parseFloat(radius)) // radius in km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50);
    } else {
      // Add distance for GeoJSON results (if not already present)
      hospitals.forEach(hospital => {
        if (!hospital.distance && hospital.address && hospital.address.coordinates) {
          hospital.distance = calculateDistance(
            latitude,
            longitude,
            hospital.address.coordinates.latitude,
            hospital.address.coordinates.longitude
          );
        }
      });
    }

    res.json({
      success: true,
      hospitals,
      count: hospitals.length
    });
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby hospitals"
    });
  }
};

// Helper function to calculate distance
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export {
  getAllHospitals,
  getHospitalById,
  addHospital,
  updateHospital,
  deleteHospital,
  addHospitalReview,
  getHospitalsBySpecialty,
  getNearbyHospitals
};

// =============== Extra Photo API ===============
// Fetch photos for a hospital by name/location via Google Places (if key configured)
export const getHospitalPhotos = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || req.query.key;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: "GOOGLE_MAPS_API_KEY not configured on backend (you can also pass ?key=YOUR_KEY for testing)" });
    }

    const { name, city, lat, lng, max = 3, radius = 5000 } = req.query;
    if (!name && !(lat && lng)) {
      return res.status(400).json({ success: false, message: "name or (lat,lng) is required" });
    }

    // Build a query for Text Search
    const query = [name, city].filter(Boolean).join(", ");
    const locParam = lat && lng ? `&location=${lat},${lng}&radius=${radius}` : "";

    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}${locParam}&type=hospital&key=${apiKey}`;
    const tsResp = await fetch(textSearchUrl, { timeout: 8000 });
    const tsData = await tsResp.json();

    if (tsData.status !== "OK" || !Array.isArray(tsData.results) || tsData.results.length === 0) {
      return res.json({ success: true, photos: [], source: "google", note: tsData.status });
    }

    const placeId = tsData.results[0].place_id;
    // Get details to fetch photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,photo,website,url,formatted_phone_number&key=${apiKey}`;
    const dResp = await fetch(detailsUrl, { timeout: 8000 });
    const details = await dResp.json();

    if (details.status !== "OK" || !details.result) {
      return res.json({ success: true, photos: [], source: "google", placeId, note: details.status });
    }

    const photos = (details.result.photos || []).slice(0, Math.min(parseInt(max), 5)).map((p) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${p.photo_reference}&key=${apiKey}`
    );

    return res.json({ success: true, photos, source: "google", placeId });
  } catch (error) {
    console.error("Error fetching hospital photos:", error);
    return res.status(500).json({ success: false, message: "Error fetching photos" });
  }
};