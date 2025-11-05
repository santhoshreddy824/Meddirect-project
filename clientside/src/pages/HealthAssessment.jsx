import { useState } from "react";
import { toast } from "react-toastify";

const HealthAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentType, setAssessmentType] = useState(null);

  const assessmentTypes = [
    {
      id: "general",
      title: "General Health Checkup",
      description:
        "Comprehensive health assessment covering basic health indicators",
      icon: "🏥",
      duration: "5-7 minutes",
    },
    {
      id: "mental",
      title: "Mental Health Assessment",
      description: "Evaluate your mental wellbeing and stress levels",
      icon: "🧠",
      duration: "3-5 minutes",
    },
    {
      id: "heart",
      title: "Cardiovascular Risk Assessment",
      description: "Check your heart health and cardiovascular risk factors",
      icon: "❤️",
      duration: "4-6 minutes",
    },
    {
      id: "lifestyle",
      title: "Lifestyle Health Check",
      description: "Assess your daily habits and their impact on your health",
      icon: "🏃‍♂️",
      duration: "3-4 minutes",
    },
  ];

  const questionSets = {
    general: [
      {
        id: 1,
        question: "What is your age group?",
        type: "radio",
        options: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
      },
      {
        id: 2,
        question: "How would you rate your overall health?",
        type: "radio",
        options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
      },
      {
        id: 3,
        question: "Do you have any chronic conditions?",
        type: "checkbox",
        options: [
          "Diabetes",
          "High Blood Pressure",
          "Heart Disease",
          "Asthma",
          "Arthritis",
          "None",
        ],
      },
      {
        id: 4,
        question: "How many hours do you sleep per night on average?",
        type: "radio",
        options: ["Less than 5", "5-6", "7-8", "9-10", "More than 10"],
      },
      {
        id: 5,
        question: "How often do you exercise?",
        type: "radio",
        options: [
          "Daily",
          "3-4 times a week",
          "1-2 times a week",
          "Rarely",
          "Never",
        ],
      },
    ],
    mental: [
      {
        id: 1,
        question:
          "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
        type: "radio",
        options: [
          "Not at all",
          "Several days",
          "More than half the days",
          "Nearly every day",
        ],
      },
      {
        id: 2,
        question: "How well do you handle stress?",
        type: "radio",
        options: ["Very well", "Well", "Moderately", "Poorly", "Very poorly"],
      },
      {
        id: 3,
        question: "How often do you feel overwhelmed?",
        type: "radio",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
      {
        id: 4,
        question: "Do you have a support system (family, friends, etc.)?",
        type: "radio",
        options: [
          "Strong support",
          "Good support",
          "Some support",
          "Little support",
          "No support",
        ],
      },
    ],
    heart: [
      {
        id: 1,
        question: "Do you smoke?",
        type: "radio",
        options: [
          "Never",
          "Former smoker",
          "Occasionally",
          "Daily (less than 1 pack)",
          "Daily (1+ packs)",
        ],
      },
      {
        id: 2,
        question: "What is your BMI range?",
        type: "radio",
        options: [
          "Underweight (<18.5)",
          "Normal (18.5-24.9)",
          "Overweight (25-29.9)",
          "Obese (30+)",
          "Not sure",
        ],
      },
      {
        id: 3,
        question: "Do you have a family history of heart disease?",
        type: "radio",
        options: [
          "No",
          "Yes - one parent",
          "Yes - both parents",
          "Yes - siblings",
          "Yes - multiple relatives",
        ],
      },
      {
        id: 4,
        question: "How often do you consume alcohol?",
        type: "radio",
        options: [
          "Never",
          "Rarely",
          "1-2 drinks per week",
          "3-7 drinks per week",
          "More than 7 per week",
        ],
      },
    ],
    lifestyle: [
      {
        id: 1,
        question:
          "How many servings of fruits and vegetables do you eat daily?",
        type: "radio",
        options: ["0-1", "2-3", "4-5", "6-7", "8+"],
      },
      {
        id: 2,
        question: "How much water do you drink daily?",
        type: "radio",
        options: [
          "Less than 2 glasses",
          "2-4 glasses",
          "5-7 glasses",
          "8+ glasses",
        ],
      },
      {
        id: 3,
        question: "How often do you eat fast food or processed foods?",
        type: "radio",
        options: [
          "Never",
          "Rarely",
          "1-2 times per week",
          "3-4 times per week",
          "Daily",
        ],
      },
      {
        id: 4,
        question:
          "How many hours do you spend on screens daily (TV, phone, computer)?",
        type: "radio",
        options: ["Less than 2", "2-4", "5-7", "8-10", "More than 10"],
      },
    ],
  };

  const startAssessment = (type) => {
    setAssessmentType(type);
    setCurrentStep(0);
    setResponses({});
    setShowResults(false);
  };

  const handleResponse = (questionId, answer) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    const questions = questionSets[assessmentType];
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  const prevQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = () => {
    setShowResults(true);
    toast.success("Assessment completed! Here are your results.");
  };

  const getHealthScore = () => {
    // Simple scoring algorithm - in real app, this would be more sophisticated
    const totalQuestions = questionSets[assessmentType].length;
    let score = 0;

    Object.values(responses).forEach((response, index) => {
      if (Array.isArray(response)) {
        score += response.length > 0 ? 3 : 1;
      } else {
        // Simple scoring based on response position
        const responseIndex =
          questionSets[assessmentType][index]?.options.indexOf(response) || 0;
        score += Math.max(1, 5 - responseIndex);
      }
    });

    return Math.round((score / (totalQuestions * 5)) * 100);
  };

  const getRecommendations = () => {
    const score = getHealthScore();

    if (score >= 80) {
      return {
        level: "Excellent",
        color: "green",
        recommendations: [
          "Keep up the great work with your healthy lifestyle!",
          "Continue regular check-ups with your healthcare provider",
          "Consider being a health mentor to others",
        ],
      };
    } else if (score >= 60) {
      return {
        level: "Good",
        color: "blue",
        recommendations: [
          "You're on the right track, with room for improvement",
          "Focus on areas where you scored lower",
          "Consider consulting a healthcare provider for personalized advice",
        ],
      };
    } else if (score >= 40) {
      return {
        level: "Fair",
        color: "yellow",
        recommendations: [
          "There are several areas where you can improve your health",
          "Consider making gradual lifestyle changes",
          "Schedule a check-up with your doctor",
        ],
      };
    } else {
      return {
        level: "Needs Attention",
        color: "red",
        recommendations: [
          "It's important to address your health concerns",
          "Please consult with a healthcare provider soon",
          "Consider making significant lifestyle changes",
        ],
      };
    }
  };

  if (!assessmentType) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Health Assessment
            </h1>
            <p className="text-gray-600 text-lg">
              Take a comprehensive health assessment to understand your
              wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {assessmentTypes.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => startAssessment(assessment.id)}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{assessment.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {assessment.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 text-center">
                  {assessment.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    ⏱️ {assessment.duration}
                  </span>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Start Assessment
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">
              Why Take a Health Assessment?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-medium mb-2">Track Your Health</h4>
                <p className="text-sm text-gray-600">
                  Monitor your health status over time
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">💡</div>
                <h4 className="font-medium mb-2">Get Insights</h4>
                <p className="text-sm text-gray-600">
                  Receive personalized health recommendations
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-medium mb-2">Set Goals</h4>
                <p className="text-sm text-gray-600">
                  Identify areas for health improvement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = getHealthScore();
    const recommendations = getRecommendations();

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Assessment Results
              </h2>
              <div
                className={`text-6xl font-bold text-${recommendations.color}-600 mb-2`}
              >
                {score}%
              </div>
              <div
                className={`text-xl font-semibold text-${recommendations.color}-600`}
              >
                {recommendations.level}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {recommendations.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Disclaimer:</strong> This assessment is for
                informational purposes only and should not replace professional
                medical advice. Please consult with a healthcare provider for
                proper medical evaluation and treatment.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setAssessmentType(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Take Another Assessment
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Print Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const questions = questionSets[assessmentType];
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.type === "radio"
                ? currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={responses[currentQuestion.id] === option}
                        onChange={(e) =>
                          handleResponse(currentQuestion.id, e.target.value)
                        }
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))
                : currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={(responses[currentQuestion.id] || []).includes(
                          option
                        )}
                        onChange={(e) => {
                          const currentResponses =
                            responses[currentQuestion.id] || [];
                          if (e.target.checked) {
                            handleResponse(currentQuestion.id, [
                              ...currentResponses,
                              option,
                            ]);
                          } else {
                            handleResponse(
                              currentQuestion.id,
                              currentResponses.filter((r) => r !== option)
                            );
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentStep === 0}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              disabled={!responses[currentQuestion.id]}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === questions.length - 1
                ? "Finish Assessment"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAssessment;
