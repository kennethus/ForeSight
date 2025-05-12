import { useState, useRef } from "react";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is ForeSight?",
        a: "ForeSight is a web app designed to help UPLB students manage personal finances efficiently. It is integrated with AI to analyze your background information and spending habits and suggest personalized budgets.",
      },
      {
        q: "Is it free to use?",
        a: "Yes, ForeSight is completely free for all UPLB students.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "How do I create an account?",
        a: "To sign up, go to the Sign-Up page and provide your Full Name, Username, Age, Sex, Email, Password, and Initial Balance. Once submitted, you can log in using your email and password.",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "Currently, password reset functionality is not available, but we're working on it. Please contact support for assistance.",
      },
    ],
  },
  {
    category: "Dashboard",
    questions: [
      {
        q: "What can I see on the Dashboard?",
        a: "Your Dashboard gives a quick overview of your finances through current balance, spending breakdown (pie chart), recent transactions (table), spending trends (line graph), and budget status.",
      },
      {
        q: "Why is my balance different from my budget or goal amounts?",
        a: "Your current balance reflects total funds, while budgets and goals track planned or saved amounts independently.",
      },
    ],
  },
  {
    category: "Profile",
    questions: [
      {
        q: "Can I update my personal information?",
        a: "Yes, you can update your Name, Email, Age, and Sex from the Profile page.",
      },
    ],
  },
  {
    category: "Transactions",
    questions: [
      {
        q: "How do I add a new transaction?",
        a: "Click the 'Add Transaction' button and fill in the details such as name, description, amount, category, type (Income/Expense), date/time, and budget allocation.",
      },
      {
        q: "Can I import multiple transactions at once?",
        a: "Yes. You can upload a CSV file following the required format to import past transactions.",
      },
      {
        q: "Why are some amounts red and others green?",
        a: "Red amounts indicate expenses, and green amounts represent income.",
      },
    ],
  },
  {
    category: "Budgets",
    questions: [
      {
        q: "How do budgets work?",
        a: "Budgets help you plan and monitor spending. Each budget has a name, allocated amount, start/end date, a progress bar, color-coded status, and related transactions.",
      },
      {
        q: "Can I create multiple budgets?",
        a: "Absolutely! You can track different areas like food, transportation, or academics with separate budgets.",
      },
    ],
  },
  {
    category: "Goals",
    questions: [
      {
        q: "What are savings goals?",
        a: "Goals help you save for specific objectives by setting a target amount and date. You can track progress through a pie chart and update the saved amount anytime.",
      },
      {
        q: "How do I update my progress toward a goal?",
        a: "Go to the Goals page, select your goal, and click the update button to adjust the saved amount.",
      },
    ],
  },
  {
    category: "Forecast",
    questions: [
      {
        q: "What is the Forecast feature?",
        a: "It uses machine learning to predict your total monthly expenses and recommend how much to allocate for each category based on your spending history and demographic profile.",
      },
      {
        q: "How does ForeSight predict my future expenses?",
        a: "ForeSight uses a machine learning algorithm called Random Forest, which analyzes your socio-demographic profile (like year level, allowance, and living situation) and your past transactions to forecast your monthly expenses across categories like food, transportation, and academics.",
      },
      {
        q: "Where does ForeSight get the data for predictions?",
        a: "The forecast is based on two types of data: (1) your responses to a background survey when you sign up, and (2) your historical transaction records logged within the app. These are used together to generate more accurate and personalized budget suggestions.",
      },
      {
        q: "Why do I need to have three months of transaction data?",
        a: "ForeSight uses time series analysis through Exponential Smoothing to detect your spending patterns. At least three months of data is required to identify trends and seasonality, which helps in producing reliable forecasts.",
      },
      {
        q: "What happens if I’m a new user with no transaction history?",
        a: "If you don’t have enough transaction data yet, ForeSight will generate your initial budget using your socio-demographic profile. As you log more transactions, the forecast becomes more accurate by combining both historical and profile-based predictions.",
      },
      {
        q: "How accurate are the forecasts?",
        a: "ForeSight continuously evaluates the accuracy of its past predictions using standard metrics like R², RMSE, and MAE. It dynamically adjusts future predictions based on how well previous forecasts matched your actual expenses.",
      },
      {
        q: "Can I apply the recommended budget automatically?",
        a: "Yes, simply click the 'Generate Budget' button on the Forecast page to create a budget based on the recommendations.",
      },
    ],
  },
  {
    category: "Technical & Miscellaneous",
    questions: [
      {
        q: "Which devices and browsers are supported?",
        a: "The app works best on modern browsers like Chrome, Firefox, and Edge. It is mobile-friendly but optimized for desktop use. Please ensure that third-party cookies are allowed, as they are required for proper authentication and session management.",
      },
      {
        q: "How can I delete my account or data?",
        a: "Please contact support to request account deletion. Full data erasure will be performed securely.",
      },
    ],
  },
];

const Faqs = () => {
  const [openKey, setOpenKey] = useState(null);
  const refs = useRef({});

  const toggle = (key) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
        Frequently Asked Questions
      </h1>

      {faqs.map((section) => (
        <div key={section.category} className="mb-10">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            {section.category}
          </h2>
          <div className="space-y-3">
            {section.questions.map((faq) => {
              const key = `${section.category}-${faq.q}`;
              const isOpen = openKey === key;

              return (
                <div
                  key={key}
                  className="border bg-blue-900 border-blue-50 rounded-lg shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full bg-white flex border-blue-900 border-2 justify-between items-center px-4 py-3 text-left text-blue-900 font-medium focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>

                  <div
                    ref={(el) => (refs.current[key] = el)}
                    className={`px-4 text-white transition-all duration-300 ease-in-out bg-blue-900 ${
                      isOpen ? "max-h-96 py-4" : "max-h-0 py-0"
                    } overflow-hidden`}
                  >
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Faqs;
