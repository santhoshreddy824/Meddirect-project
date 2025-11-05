import { useState } from "react";

const questions = [
  {
    q: "How do I book an appointment?",
    a: "Simply browse doctors, select your preferred specialist, and click 'Book Appointment'. Follow the prompts to confirm your booking.",
  },
  {
    q: "Can I consult doctors online?",
    a: "Yes, MedDirect offers both in-person and online consultations. Choose your preferred mode while booking.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit/debit cards, UPI, net banking, and wallets.",
  },
  {
    q: "Is my health data secure?",
    a: "Absolutely. We use advanced encryption and never share your data without your consent.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us via the Contact Us page or email support@meddirect.com.",
  },
];

const Questions = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="my-20 px-4 md:px-10 lg:px-32">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-primary">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 max-w-2xl mx-auto">
        {questions.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow">
            <button
              className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
              onClick={() => toggle(idx)}
              aria-expanded={openIdx === idx}
            >
              <span className="font-semibold text-lg text-gray-800">
                {item.q}
              </span>
              <span className="text-2xl text-primary font-bold">
                {openIdx === idx ? "-" : "+"}
              </span>
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 text-gray-600 animate-fade-in">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Questions;
