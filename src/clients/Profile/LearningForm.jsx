import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LearningDataContext } from "../../Contexts/LearningData";

export default function LearningForm() {
  const { sendLearning, id, learningggg } = useContext(LearningDataContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [school, setSchool] = useState(learningggg?.school || "");
  const [degree, setDegree] = useState(learningggg?.degree || "");
  const [startDte, setStartDte] = useState(learningggg?.startDte || "");
  const [endDte, setEndDte] = useState(learningggg?.endDte || "");
  const [grade, setGrade] = useState(learningggg?.grade || "");
  const [activities, setActivities] = useState(learningggg?.activities || "");
  const [description, setDescription] = useState(learningggg?.description || "");
  const [about, setAbout] = useState(learningggg?.about || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Array of school and degree options
  const schoolOptions = [
    "Tanta University",
    "Cairo University",
    "Alexandria University",
    "Ain Shams University",
    "American University in Cairo",
    "Mansoura University",
    "Zagazig University",
    "Helwan University",
    "Assiut University",
    "Fayoum University",
    "Benha University",
  ];

  const collegeOptions = [
    "Faculty of Medicine",
    "Faculty of Engineering",
    "Faculty of Commerce",
    "Faculty of Law",
    "Faculty of Arts",
    "Faculty of Science",
    "Faculty of Education",
    "Faculty of Agriculture",
    "Faculty of Pharmacy",
    "Faculty of Dentistry",
    "Faculty of Computer Science",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await sendLearning(
        school || "",        // Ensure empty string is passed if value is empty
        degree || "",        // Ensure empty string is passed if value is empty
        startDte || "",      // Ensure empty string is passed if value is empty
        endDte || "",        // Ensure empty string is passed if value is empty
        grade || "",         // Ensure empty string is passed if value is empty
        activities || "",    // Ensure empty string is passed if value is empty
        description || "",   // Ensure empty string is passed if value is empty
        about || "",         // Ensure empty string is passed if value is empty
        setErrorMessage      // Pass the error setter function to handle errors
      );

      setTimeout(() => navigate("/profile"), 2000);  // Redirect after submission
    } catch (err) {
      setLoading(false); // Stop loading on error
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-3 my-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Education Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4  p-4">

        {/* University Dropdown */}
        <div>
          <label className="block text-sm font-medium">University*</label>
          <select
            value={school || ""}  // Ensure empty string is used if no value selected
            onChange={(e) => setSchool(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="" disabled>Select a University</option>
            {schoolOptions.map((schoolName, index) => (
              <option key={index} value={schoolName}>
                {schoolName}
              </option>
            ))}
          </select>
        </div>

        {/* Degree Dropdown */}
        <div>
          <label className="block text-sm font-medium">Faculty</label>
          <select
            value={degree || ""}  // Ensure empty string is used if no value selected
            onChange={(e) => setDegree(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="" disabled>Select a Faculty</option>
            {collegeOptions.map((facultyName, index) => (
              <option key={index} value={facultyName}>
                {facultyName}
              </option>
            ))}
          </select>
        </div>

        {/* Start and End Date */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDte || ""}
              onChange={(e) => setStartDte(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDte || ""}
              onChange={(e) => setEndDte(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        {/* Grade */}
<div>
  <label className="block text-sm font-medium">Grade</label>
  <input
    type="number"
    value={grade}
    onChange={(e) => {
      const value = parseFloat(e.target.value);
      if (value >= 1 && value <= 5) {
        setGrade(value);
      }
    }}
    className="w-full p-2 border rounded-md"
    min="1"
    max="5"
    step="0.1" // Allows decimal values
  />
</div>


        {/* Activities and Societies */}
        <div>
          <label className="block text-sm font-medium">Activities and Societies</label>
          <input
            type="text"
            value={activities || ""}
            onChange={(e) => setActivities(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="3"
          ></textarea>
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-medium">About</label>
          <textarea
            value={about || ""}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="3"
          ></textarea>
        </div>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}