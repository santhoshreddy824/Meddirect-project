import { useNavigate } from "react-router-dom";

const MedicalServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Find Hospitals",
      description:
        "Locate nearby hospitals with advanced search and filtering options",
      icon: "🏥",
      path: "/hospitals",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Medication Guide",
      description:
        "Search for detailed information about medications and their effects",
      icon: "💊",
      path: "/medications",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      title: "Health Assessment",
      description:
        "Take comprehensive health assessments to monitor your wellbeing",
      icon: "📋",
      path: "/health-assessment",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Complete Medical Services
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Beyond appointments, explore our comprehensive healthcare tools
            designed to support your health journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`${service.color} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              onClick={() => navigate(service.path)}
            >
              <div className="text-center">
                <div className={`text-4xl mb-4 ${service.iconColor}`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Explore Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Why Choose MedDirect?
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-medium mb-1">Fast & Easy</h4>
                <p className="text-sm text-gray-600">
                  Quick access to medical services
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h4 className="font-medium mb-1">Secure & Private</h4>
                <p className="text-sm text-gray-600">
                  Your health data is protected
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">👨‍⚕️</div>
                <h4 className="font-medium mb-1">Expert Care</h4>
                <p className="text-sm text-gray-600">
                  Verified healthcare professionals
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-medium mb-1">24/7 Access</h4>
                <p className="text-sm text-gray-600">
                  Healthcare support anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalServices;
