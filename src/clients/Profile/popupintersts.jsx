import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import { Domain, token } from "../../utels/consts";

function PopupModal({
  isOpen,
  onClose,
  selectedInterests,
  setSelectedInterests, // Now passed for updating only on save
  customAcademicInterest,
  setCustomAcademicInterest,
  customExtracurricularInterest,
  setCustomExtracurricularInterest,
}) {
  const academicSubjects = [
    "Mathematics",
    "Science",
    "Health Education",
    "English/Language Arts",
    "Social Studies",
    "Foreign Language",
  ];

  const extracurricularActivities = [
    "Sports",
    "Music/Band",
    "Drama/Theater",
    "Debate/Forensics",
    "Art",
    "Clubs/Organizations",
  ];
  const [tempSelectedInterests, setTempSelectedInterests] = useState([...selectedInterests]);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedInterests([...selectedInterests]); // Reset temp state when modal opens
    }
  }, [isOpen, selectedInterests]);

  const handleTempCheckboxChange = (interest) => {
    setTempSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  const handleSaveChanges = async () => {
    const interestsToSend = [...tempSelectedInterests];

    if (customAcademicInterest.trim()) interestsToSend.push(customAcademicInterest.trim());
    if (customExtracurricularInterest.trim()) interestsToSend.push(customExtracurricularInterest.trim());

    try {
      await axios.put(
        `${Domain}/api/User/UpdateInterests`,
        interestsToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSelectedInterests(interestsToSend); // Update actual state only on save
      onClose();
      setCustomAcademicInterest("");
      setCustomExtracurricularInterest("");
    } catch (error) {
      console.error("Error updating interests:", error);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="max-w-lg w-full bg-white p-4 rounded-lg shadow-lg relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            ✖
          </button>

          <h2 className="text-lg font-semibold mb-2">Area(s) of Interest:</h2>

          <div className="mb-4">
            <p className="font-medium">Academic Subjects:</p>
            <div className="space-y-2 mt-2">
              {academicSubjects.map((subject, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    checked={tempSelectedInterests.includes(subject)}
                    onChange={() => handleTempCheckboxChange(subject)}
                  />
                  <span>{subject}</span>
                </label>
              ))}

            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="font-medium">Extracurricular Activities:</p>
            <div className="space-y-2 mt-2">
              {extracurricularActivities.map((activity, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    checked={tempSelectedInterests.includes(activity)}
                    onChange={() => handleTempCheckboxChange(activity)}
                  />
                  <span>{activity}</span>
                </label>
              ))}

            </div>
          </div>

          <button
            onClick={handleSaveChanges}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    )
  );
}

export default PopupModal;
