import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import DoctorImage from "../../components/DoctorImage";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, backendUrl } =
    useContext(DoctorContext);

  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({
    fees: "",
    available: false,
    address: { line1: "", line2: "" },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize edit data when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        fees: profileData.fees || "",
        available: profileData.available || false,
        address: {
          line1: profileData.address?.line1 || "",
          line2: profileData.address?.line2 || "",
        },
      });
    }
  }, [profileData]);

  // Load profile data on component mount
  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken, getProfileData]);

  const handleFeesChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setEditData((prev) => ({
        ...prev,
        fees: value === "" ? "" : parseInt(value),
      }));
    }
  };

  const handleAvailabilityToggle = () => {
    if (isEdit) {
      setEditData((prev) => ({
        ...prev,
        available: !prev.available,
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const updateProfile = async () => {
    if (isLoading) return; // Prevent multiple submissions

    try {
      // Validate fees
      if (!editData.fees || editData.fees < 0) {
        toast.error("Please enter a valid consultation fee");
        return;
      }

      setIsLoading(true);

      const updateData = {
        address: editData.address,
        fees: Number(editData.fees),
        available: editData.available,
      };

      console.log("Updating profile with data:", updateData);

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        setIsEdit(false);
        await getProfileData(); // Refresh profile data
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset edit data to original profile data
    if (profileData) {
      setEditData({
        fees: profileData.fees || "",
        available: profileData.available || false,
        address: {
          line1: profileData.address?.line1 || "",
          line2: profileData.address?.line2 || "",
        },
      });
    }
    setIsEdit(false);
  };

  return (
    profileData && (
      <div>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <DoctorImage
              doctor={profileData}
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              alt={profileData.name}
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* ------- Doc Info: name, degree, experience ------- */}

            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {profileData.experience}
              </button>
            </div>

            {/* ------- Doc About ------- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className="text-gray-500 font-medium">
                Appointment Fee:
              </span>
              {isEdit ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="border border-gray-300 rounded px-3 py-2 w-32 text-green-600 font-semibold focus:border-primary focus:outline-none transition-colors"
                    value={editData.fees}
                    onChange={handleFeesChange}
                    placeholder="Enter fee"
                    autoComplete="off"
                  />
                </div>
              ) : (
                <span className="text-green-600 font-semibold">
                  ₹{profileData?.fees || 0}
                </span>
              )}
            </div>

            <div className="flex gap-2 py-2">
              <p className="font-medium">Address:</p>
              <div className="text-sm flex-1">
                {isEdit ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:border-primary focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleAddressChange("line1", e.target.value)
                    }
                    value={editData.address.line1}
                    placeholder="Address Line 1"
                  />
                ) : (
                  <p>{profileData?.address?.line1 || "Not provided"}</p>
                )}
                {isEdit ? (
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleAddressChange("line2", e.target.value)
                    }
                    value={editData.address.line2}
                    placeholder="Address Line 2"
                  />
                ) : (
                  <p>{profileData?.address?.line2 || "Not provided"}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    isEdit
                      ? editData.available
                      : profileData?.available || false
                  }
                  onChange={handleAvailabilityToggle}
                  disabled={!isEdit}
                  className={`w-4 h-4 rounded border-2 transition-all ${
                    isEdit ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  } ${
                    (isEdit ? editData.available : profileData?.available)
                      ? "bg-green-500 border-green-500"
                      : "bg-red-100 border-red-300"
                  }`}
                />
                <span
                  className={`font-medium transition-colors ${
                    (isEdit ? editData.available : profileData?.available)
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {(isEdit ? editData.available : profileData?.available)
                    ? "Available for appointments"
                    : "Not available"}
                </span>
              </label>
            </div>

            {isEdit ? (
              <div className="flex gap-3 mt-5">
                <button
                  onClick={updateProfile}
                  className="px-6 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!editData.fees || editData.fees < 0 || isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 text-gray-600 text-sm rounded-full hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-6 py-2 border border-primary text-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
