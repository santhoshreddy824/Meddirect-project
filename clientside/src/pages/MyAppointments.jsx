import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import DoctorImage from "../components/DoctorImage";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, currencySymbol } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [backendUrl, token]);

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handlePayment = (appointmentId) => {
    navigate(`/payment?appointmentId=${appointmentId}`);
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token, getUserAppointments]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <DoctorImage
                doctor={item.docData}
                className="w-32 bg-indigo-50"
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>

              {/* Payment Status Indicator */}
              <div className="mt-2">
                {item.payment ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Payment Completed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-orange-600 font-medium">
                      Payment Pending
                    </span>
                  </div>
                )}

                {/* Appointment Fee */}
                <p className="text-xs text-gray-500 mt-1">
                  Consultation Fee: {currencySymbol}
                  {item.docData.fees}
                </p>
              </div>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {/* Enhanced Pay Online Button */}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <div className="space-y-2">
                  <button
                    onClick={() => handlePayment(item._id)}
                    className="w-full sm:min-w-48 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    💳 Pay Online - {currencySymbol}
                    {item.docData.fees}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment with multiple options
                  </p>
                </div>
              )}

              {/* Payment Completed Status */}
              {!item.cancelled && item.payment && !item.isCompleted && (
                <div className="space-y-2">
                  <button className="w-full sm:min-w-48 py-3 px-4 border-2 border-green-500 rounded-lg text-green-600 font-medium bg-green-50">
                    ✅ Payment Completed
                  </button>
                  <p className="text-xs text-green-600 text-center">
                    Ready for appointment
                  </p>
                </div>
              )}

              {/* Cancel Button - Only show if payment not completed */}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-gray-500 text-center sm:min-w-48 py-2 border border-gray-300 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}

              {/* Cancelled Status */}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border-2 border-red-500 rounded-lg text-red-600 bg-red-50 font-medium">
                  ❌ Appointment Cancelled
                </button>
              )}

              {/* Completed Status */}
              {item.isCompleted && (
                <div className="space-y-2">
                  <button className="w-full sm:min-w-48 py-3 px-4 border-2 border-green-500 rounded-lg text-green-600 font-medium bg-green-50">
                    🎉 Completed
                  </button>
                  <p className="text-xs text-green-600 text-center">
                    {item.payment
                      ? "Paid & Completed"
                      : "Completed - No payment required"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
