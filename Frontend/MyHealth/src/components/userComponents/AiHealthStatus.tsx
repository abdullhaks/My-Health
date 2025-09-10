import { useState, useMemo } from "react"; 
import { FaHeartbeat, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { ApiError } from "../../interfaces/error";

const AiHealthStatusGenerator = () => {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [sugar, setSugar] = useState<string>("");
  const [pressure, setPressure] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useMemo to memoize these objects so they are only created once
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const genAI = useMemo(() => new GoogleGenerativeAI(apiKey), [apiKey]);

  const model = useMemo(() => genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  }), [genAI]);

  const generationConfig = useMemo(() => ({
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  }), []); // Empty dependency array as config doesn't change

  // run function also depends on model and generationConfig, so best to wrap it too
  const run = useMemo(() => async (prompt: string) => { // Changed promt to prompt, and type to string
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
    return result.response.text();
  }, [model, generationConfig]);


  const generateHealthStatus = async () => {
    setError(null);
    setHealthStatus(null);
    setLoading(true);

    if (!height || !weight || !age) {
      setError("Please fill in height, weight, and age.");
      setLoading(false);
      return;
    }

    const prompt = `Generate a basic health status and provide concise tips and awareness paragraphs for a person with the following details:
    Height: ${height} cm
    Weight: ${weight} kg
    Age: ${age} years
    ${sugar ? `Blood Sugar: ${sugar} mg/dL` : ""}
    ${pressure ? `Blood Pressure: ${pressure} (e.g., 120/80 mmHg)` : ""}

    Please provide the output in a conversational, friendly, and informative tone.
    Structure the response clearly with sections like:
    1. Overall Health Summary: (1-2 paragraphs)
    2. Personalized Tips: (bullet points or short paragraphs based on provided data, if applicable)
    3. General Health Awareness: (1-2 paragraphs on common healthy habits)

    Crucial Disclaimer: This information is for general knowledge and informational purposes only, and does not constitute medical advice. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here.`;

    try {
      const generatedText = await run(prompt);
      setHealthStatus(generatedText);
    } catch (err ) {
      console.error("Error generating health status:", err);
      setError(
        `Failed to generate health status: ${
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message
            : "An unknown error occurred."
        } Please check your Gemini API key and quota.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
        <FaHeartbeat /> Health Status Generator
      </h2>

      <p className="text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-md flex items-center">
        <FaInfoCircle className="mr-2 text-yellow-600" />
        <span className="font-semibold">Disclaimer:</span> This tool provides
        informational insights based on basic details. It is NOT a substitute
        for professional medical advice, diagnosis, or treatment. Always consult
        with a qualified healthcare professional for any health concerns.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="height"
            className="block text-sm font-medium text-gray-700"
          >
            Height (cm)
          </label>
          <input
            type="number"
            id="height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 175"
          />
        </div>
        <div>
          <label
            htmlFor="weight"
            className="block text-sm font-medium text-gray-700"
          >
            Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 70"
          />
        </div>
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            Age (years)
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <label
            htmlFor="sugar"
            className="block text-sm font-medium text-gray-700"
          >
            Blood Sugar (mg/dL) - Optional
          </label>
          <input
            type="text"
            id="sugar"
            value={sugar}
            onChange={(e) => setSugar(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 90"
          />
        </div>
        <div>
          <label
            htmlFor="pressure"
            className="block text-sm font-medium text-gray-700"
          >
            Blood Pressure (e.g., 120/80) - Optional
          </label>
          <input
            type="text"
            id="pressure"
            value={pressure}
            onChange={(e) => setPressure(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 120/80"
          />
        </div>
      </div>

      <button
        onClick={generateHealthStatus}
        className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <FaSpinner className="animate-spin mr-2" /> Generating...
          </span>
        ) : (
          "Generate Health Status"
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {healthStatus && (
        <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-200 shadow-inner">
          <h3 className="text-xl font-bold mb-4 text-blue-700">
            Your Health Status & Tips:
          </h3>
          <div className="prose max-w-none text-gray-800 leading-relaxed">
            {healthStatus.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiHealthStatusGenerator;