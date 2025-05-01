import { useState, useContext, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const FeatureModal = ({ isOpen, onClose, feature }) => {
  const { auth } = useContext(AuthContext);
  const isNewFeature = !feature;
  const modalRef = useRef(null);

  const [formData, setFormData] = useState(
    feature ?? {
      yearLevel: "",
      inRelationship: false,
      personality: "",
      homeRegion: "",
      livingSituation: "",
      dormArea: "",
      numberOfRoommates: "",
      degreeProgram: "",
      haveOrganization: false,
      studyHoursPerWeek: "",
      monthlyAllowance: 0,
      familyMonthlyIncome: "",
      hasScholarship: false,
      hasJobOrBusiness: false,
      mealPreferences: "",
      frequencyGoingHomePerSemester: "",
      preferredPaymentMethod: "",
      hasHealthConcerns: false,
      healthConcernDetails: "",
      hasTrackExpensesBefore: false,
    }
  );

  const [isEditing, setIsEditing] = useState(isNewFeature);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      setFormData((prevFormData) => feature ?? prevFormData);
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, feature]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      console.log("Submitting Form:", formData);

      const response =
        isNewFeature ?
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/features/`,
            { userId: auth._id, ...formData },
            { withCredentials: true }
          )
        : await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/features/${feature._id}`,
            formData,
            { withCredentials: true }
          );

      alert(
        isNewFeature ?
          "Feature added successfully!"
        : "Feature updated successfully!"
      );
      setIsEditing(false);
      setSubmitLoading(false);
      onClose(response.data.data);
    } catch (error) {
      console.error("Error saving feature:", error.response?.data);
      setSubmitLoading(false);
      alert("Failed to save feature.");
    }
  };

  const degreePrograms = [
    "BA Communication Arts",
    "BA Philosophy",
    "BA Sociology",
    "BS Accountancy",
    "BS Agribusiness Management and Entrepreneurship",
    "BS Agricultural and Applied Economics",
    "BS Agricultural and Biosystems Engineering",
    "BS Agricultural Biotechnology",
    "BS Agricultural Chemistry",
    "BS Agriculture",
    "BS Applied Mathematics",
    "BS Applied Physics",
    "BS Biology",
    "BS Chemistry",
    "BS Chemical Engineering",
    "BS Civil Engineering",
    "BS Computer Science",
    "BS Development Communication",
    "BS Economics",
    "BS Electrical Engineering",
    "BS Food Science and Technology",
    "BS Forestry",
    "BS Human Ecology",
    "BS Industrial Engineering",
    "BS Mathematics",
    "BS Mathematics and Science Teaching",
    "BS Materials Engineering",
    "BS Mechanical Engineering",
    "BS Nutrition",
    "BS Statistics",
    "Doctor of Veterinary Medicine",
  ];

  return (
    <dialog
      ref={modalRef}
      className="fixed w-md h-9/12 md:w-lg lg:w-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black bg-opacity-50"
    >
      <div className="bg-white w-full max-w-lg md:max-w-xl lg:max-w-2xl min-h-sm p-5 items-center justify-center rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        {" "}
        <h2 className="text-xl font-semibold text-center mb-4">
          {isNewFeature ? "Add User Details" : "User Details"}
        </h2>
        <div className="modal-body">
          <form onSubmit={handleSave} className="flex flex-col gap-2">
            {/* Socio-Demographic Information */}
            <label>Degree Program</label>
            <select
              className="input-field"
              name="degreeProgram"
              value={formData.degreeProgram}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select Year Level</option>
              {degreePrograms.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>

            <label>Year Level</label>
            <select
              className="input-field"
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select Year Level</option>
              {["Freshman", "Sophomore", "Junior", "Senior"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row gap-2">
              <label>Do you belong in an Organization?</label>
              <label>
                <input
                  type="radio"
                  name="haveOrganization"
                  value={true}
                  checked={formData.haveOrganization === true}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="haveOrganization"
                  value={false}
                  checked={formData.haveOrganization === false}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                No
              </label>
            </div>

            <label>Study Hours Per Week</label>
            <select
              className="input-field"
              name="studyHoursPerWeek"
              value={formData.studyHoursPerWeek}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select study hours per week</option>
              {[
                "Less than 10 hours",
                "10-20 hours",
                "21-30 hours",
                "31-40 hours",
                "More than 40 hours",
              ].map((hours) => (
                <option key={hours} value={hours}>
                  {hours}
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row gap-2">
              <label>In a Relationship?</label>
              <label>
                <input
                  type="radio"
                  name="inRelationship"
                  value={true}
                  checked={formData.inRelationship === true}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="inRelationship"
                  value={false}
                  checked={formData.inRelationship === false}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                No
              </label>
            </div>

            <label>Personality</label>
            <select
              className="input-field"
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select Personality</option>
              {["Introvert", "Extrovert", "Ambivert"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label>Home Region</label>
            <select
              name="homeRegion"
              className="input-field"
              value={formData.homeRegion}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select Home Region</option>
              {[
                "Northern Luzon",
                "Central Luzon",
                "Metro Manila",
                "Southern Luzon",
                "Visayas",
                "Mindanao",
              ].map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <label>Living Situation</label>
            <select
              name="livingSituation"
              value={formData.livingSituation}
              onChange={handleChange}
              disabled={!isEditing}
              className="input-field"
            >
              <option value="">Select current living situation</option>
              {["Inside campus", "Outside campus", "With family"].map(
                (situation) => (
                  <option key={situation} value={situation}>
                    {situation}
                  </option>
                )
              )}
            </select>

            <label>Dorm Area</label>
            <select
              name="dormArea"
              className="input-field"
              value={formData.dormArea}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select dorm area</option>
              {[
                "Kaliwa",
                "Kanan",
                "UP Dorm",
                "Raymundo",
                "Umali",
                "Demarces",
                "Agapita",
                "Junction",
                "Lopez Ave",
                "Mayondon",
                "Bae",
                "Anos",
                "Others",
              ].map((dorm) => (
                <option key={dorm} value={dorm}>
                  {dorm}
                </option>
              ))}
            </select>

            <label>Roommates</label>
            <select
              className="input-field"
              name="numberOfRoommates"
              value={formData.numberOfRoommates}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select number of roommates</option>
              {[
                "I live alone",
                "I live with 1 roommate",
                "I live with 2-3 roommates",
                "I live with more than 3 roommates",
                "I live with family",
              ].map((roommates) => (
                <option key={roommates} value={roommates}>
                  {roommates}
                </option>
              ))}
            </select>

            {/* Financial Information */}
            <h3>Financial Information</h3>

            <label>Monthly Allowance</label>
            <input
              className="input-field"
              type="number"
              name="monthlyAllowance"
              value={formData.monthlyAllowance}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <label>Family Monthly Income</label>
            <select
              className="input-field"
              name="familyMonthlyIncome"
              value={formData.familyMonthlyIncome}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select Income Range</option>
              {[
                "Less than P12,030",
                "P12,031 - P24,060",
                "P24,061 - P48,120",
                "P48,121 - P84,210",
                "P84,211 - P144,360",
                "P144,361 - P240,600",
                "More than P240,601",
              ].map((income) => (
                <option key={income} value={income}>
                  {income}
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row gap-2">
              <label>Are you a recipient of any Scholarship/Grants?</label>
              <label>
                <input
                  type="radio"
                  name="hasScholarship"
                  value={true}
                  checked={formData.hasScholarship === true}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hasScholarship"
                  value={false}
                  checked={formData.hasScholarship === false}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                No
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label>Do you have a job/business?</label>
              <label>
                <input
                  type="radio"
                  name="hasJobOrBusiness"
                  value={true}
                  checked={formData.hasJobOrBusiness === true}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hasJobOrBusiness"
                  value={false}
                  checked={formData.hasJobOrBusiness === false}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                No
              </label>
            </div>

            <label>Meal Preferences</label>
            <select
              className="input-field"
              name="mealPreferences"
              value={formData.mealPreferences}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select meal preferences</option>
              {[
                "I cook my meals",
                "I eat out regularly",
                "I buy pre-packaged food",
                "Combination of three",
              ].map((meal) => (
                <option key={meal} value={meal}>
                  {meal}
                </option>
              ))}
            </select>

            <label>Preferred Payment Method (when spending)</label>
            <select
              className="input-field"
              name="preferredPaymentMethod"
              value={formData.preferredPaymentMethod}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select meal preferences</option>
              {[
                "Cash",
                "Online Payment",
                "Bank Transfer",
                "Combination of the three",
              ].map((payment) => (
                <option key={payment} value={payment}>
                  {payment}
                </option>
              ))}
            </select>

            <label>Frequency of Going Home every Semester</label>
            <select
              className="input-field"
              name="frequencyGoingHomePerSemester"
              value={formData.frequencyGoingHomePerSemester}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select frequency of going home</option>
              {["Not at all", "Rarely", "Sometimes", "Often", "Always"].map(
                (freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                )
              )}
            </select>

            <div className="flex flex-col sm:flex-row gap-2">
              <label>Do you have Health Concerns?</label>
              <label>
                <input
                  type="radio"
                  name="hasHealthConcerns"
                  value={true}
                  checked={formData.hasHealthConcerns === true}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hasHealthConcerns"
                  value={false}
                  checked={formData.hasHealthConcerns === false}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                No
              </label>
            </div>

            <div>
              <label>If yes, specify:</label>
              <input
                className="input-field"
                id="healthConcernDetails"
                type="text"
                name="healthConcernDetails"
                value={formData.healthConcernDetails || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label>
                Do you track your expenses through excel/spreadsheets
                before/now?
              </label>
              <label>
                <input
                  type="radio"
                  name="hasTrackExpensesBefore"
                  value={true}
                  checked={formData.hasTrackExpensesBefore === true}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="hasTrackExpensesBefore"
                  value={false}
                  checked={formData.hasTrackExpensesBefore === false}
                  onChange={handleChange}
                  disabled={!isEditing}
                />{" "}
                No
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              {isEditing ?
                <>
                  <button className="btn-primary rounded-full" type="submit">
                    {submitLoading ?
                      "Loading..."
                    : isNewFeature ?
                      "Add"
                    : "Save"}
                  </button>
                  {!isNewFeature && (
                    <button
                      className="btn-secondary rounded-full"
                      type="button"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  )}
                </>
              : <button
                  className="btn-primary rounded-full"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              }
              <button
                className="btn-secondary rounded-full"
                type="button"
                onClick={() => onClose()}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

FeatureModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  feature: PropTypes.object,
};

export default FeatureModal;
