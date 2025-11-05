import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import PaymentConfirmation from "../components/PaymentConfirmation";
import { toast } from "react-toastify";
import axios from "axios";
import DoctorImage from "../components/DoctorImage";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const fetchDocInfo = useCallback(async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    // Use the actual doctor fees from database, don't override with hardcoded pricing
    if (docInfo) {
      // Ensure fees are in INR currency format but keep the actual amount from database
      docInfo.currency = "INR";
      console.log(
        "Doctor Info with actual fees:",
        docInfo.name,
        "fees:",
        docInfo.fees,
        "docId:",
        docId
      );
    } else {
      console.log(
        "Doctor not found with docId:",
        docId,
        "Available doctors:",
        doctors.length
      );
    }
    setDocInfo(docInfo);
  }, [doctors, docId]);

  const getAvailableSlots = useCallback(async () => {
    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  }, [docInfo]);

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    const date = docSlots[slotIndex][0].datetime;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    const slotDate = day + "_" + month + "_" + year;

    const appointmentInfo = {
      doctorName: docInfo.name,
      speciality: docInfo.speciality,
      date: `${day}/${month}/${year}`,
      time: slotTime,
      fee: docInfo.fees, // Use actual doctor fees from database
      docId: docId,
      slotDate: slotDate,
      slotTime: slotTime,
    };

    setAppointmentData(appointmentInfo);
    setShowPaymentConfirmation(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        {
          docId: appointmentData.docId,
          slotDate: appointmentData.slotDate,
          slotTime: appointmentData.slotTime,
          paymentMethod: paymentResult.paymentMethod,
          paid: paymentResult.paid || false,
          paymentId: paymentResult.paymentId || null,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setShowPaymentConfirmation(false);
        getDoctorsData();

        if (paymentResult.paid) {
          toast.success("Payment successful! Appointment confirmed.");
        } else {
          toast.info(
            "Appointment booked successfully. You can pay later from My Appointments."
          );
        }

        navigate("/my-appointments");
      } else {
        if (
          data.message === "invalid signature" ||
          data.message.includes("invalid")
        ) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message?.includes("invalid")) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Error booking appointment");
      }
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentConfirmation(false);
    setAppointmentData(null);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [fetchDocInfo]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo, getAvailableSlots]);

  // Force refresh when doctors data changes (to catch fee updates)
  useEffect(() => {
    console.log("Doctors data changed, refreshing doc info");
    fetchDocInfo();
  }, [doctors, fetchDocInfo]);

  if (!docInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Doctor Details */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <DoctorImage
            doctor={docInfo}
            className="bg-primary w-full sm:max-w-72 rounded-lg"
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-gray-500 font-medium">Appointment fee:</span>
            <span className="text-primary font-semibold text-lg">
              ₹{docInfo.fees}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Slots */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {docSlots.length &&
            docSlots.map((item, index) => (
              <div
                onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index
                    ? "bg-primary text-white"
                    : "border border-gray-200"
                }`}
                key={index}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))}
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {docSlots.length &&
            docSlots[slotIndex].map((item, index) => (
              <p
                onClick={() => setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                  item.time === slotTime
                    ? "bg-primary text-white"
                    : "text-gray-400 border border-gray-300"
                }`}
                key={index}
              >
                {item.time.toLowerCase()}
              </p>
            ))}
        </div>
        <button
          onClick={bookAppointment}
          className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
        >
          Book an appointment
        </button>
      </div>

      {/* Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

      {/* Payment Confirmation Modal */}
      {appointmentData && (
        <PaymentConfirmation
          appointmentData={appointmentData}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          isVisible={showPaymentConfirmation}
        />
      )}
    </div>
  );
};

export default Appointment;
