import { useState, useContext, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const FeatureModal = ({ isOpen, onClose, feature }) => {
    const { auth } = useContext(AuthContext);
    const isNewFeature = !feature;
    const modalRef = useRef(null);

    const [formData, setFormData] = useState(feature ?? {
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
        livingExpense: 0,
        foodDiningExpense: 0,
        transportationExpense: 0,
        leisureEntertainmentExpense: 0,
        academicExpense: 0,
        hasTrackExpensesBefore: false
    });

    const [isEditing, setIsEditing] = useState(isNewFeature);

    useEffect(() => {
        if (isOpen) {
            modalRef.current?.showModal();
            setFormData(prevFormData => feature ?? prevFormData);
        } else {
            modalRef.current?.close();
        }
    }, [isOpen, feature]);
    

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === "radio" ? (value === "true") : value
        }));
    };
    

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            console.log("Submitting Form:", formData);

            const response = isNewFeature
                ? await axios.post(`${import.meta.env.VITE_API_URL}/api/features/`, { userId: auth._id, ...formData }, { withCredentials: true })
                : await axios.patch(`${import.meta.env.VITE_API_URL}/api/features/${feature._id}`, formData, { withCredentials: true });

            alert(isNewFeature ? "Feature added successfully!" : "Feature updated successfully!");
            setIsEditing(false);
            onClose(response.data.data);
        } catch (error) {
            console.error("Error saving feature:", error.response?.data);
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
        "Doctor of Veterinary Medicine"
    ];
    

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-content">
                <h2>{isNewFeature ? "Add User Details" : "User Details"}</h2>
                <div className="modal-body">
                    <form onSubmit={handleSave}>
                        {/* Socio-Demographic Information */}
                        <h3>Socio-Demographic Information</h3>

                        <label>Degree Program</label>
                        <select name="degreeProgram" value={formData.degreeProgram} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select Year Level</option>
                            {degreePrograms.map((program) => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>

                        <label>Year Level</label>
                        <select name="yearLevel" value={formData.yearLevel} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select Year Level</option>
                            {["Freshman", "Sophomore", "Junior", "Senior"].map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>

                        <div>
                            <label>Do you belong in an Organization?</label>
                            <label><input type="radio" name="haveOrganization" value={true} checked={formData.haveOrganization === true} onChange={handleChange} disabled={!isEditing} /> Yes</label>
                            <label><input type="radio" name="haveOrganization" value={false} checked={formData.haveOrganization === false} onChange={handleChange} disabled={!isEditing} /> No</label>
                        </div>

                        <label>Study Hours Per Week</label>
                        <select name="studyHoursPerWeek" value={formData.studyHoursPerWeek} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select study hours per week</option>
                            {["Less than 10 hours","10-20 hours","21-30 hours","31-40 hours","More than 40 hours"].map((hours) => (
                                <option key={hours} value={hours}>{hours}</option>
                            ))}
                        </select>

                        <div>
                            <label>In a Relationship?</label>
                            <label><input type="radio" name="inRelationship" value={true} checked={formData.inRelationship === true} onChange={handleChange} disabled={!isEditing} /> Yes</label>
                            <label><input type="radio" name="inRelationship" value={false} checked={formData.inRelationship === false} onChange={handleChange} disabled={!isEditing} /> No</label>
                        </div>

                        <label>Personality</label>
                        <select name="personality" value={formData.personality} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select Personality</option>
                            {["Introvert", "Extrovert", "Ambivert"].map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <label>Home Region</label>
                        <select name="homeRegion" value={formData.homeRegion} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select Home Region</option>
                            {["Northern Luzon", "Central Luzon", "Metro Manila", "Southern Luzon", "Visayas", "Mindanao"].map((region) => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>

                        <label>Living Situation</label>
                        <select name="livingSituation" value={formData.livingSituation} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select current living situation</option>
                            {["Inside campus", "Outside campus", "With family"].map((situation) => (
                                <option key={situation} value={situation}>{situation}</option>
                            ))}
                        </select>

                        <label>Dorm Area</label>
                        <select name="dormArea" value={formData.dormArea} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select dorm area</option>
                            {["Kaliwa", "Kanan", "UP Dorm", "Raymundo", "Umali", "Demarces", "Agapita", "Junction", "Lopez Ave", "Mayondon", "Bae", "Anos", "Others"].map((dorm) => (
                                <option key={dorm} value={dorm}>{dorm}</option>
                            ))}
                        </select>

                        <label>Roommates</label>
                        <select name="numberOfRoommates" value={formData.numberOfRoommates} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select number of roommates</option>
                            {["I live alone", "I live with 1 roommate", "I live with 2-3 roommates", "I live with more than 3 roommates", "I live with family"].map((roommates) => (
                                <option key={roommates} value={roommates}>{roommates}</option>
                            ))}
                        </select>

                        {/* Financial Information */}
                        <h3>Financial Information</h3>

                        <label>Monthly Allowance</label>
                        <input type="number" name="monthlyAllowance" value={formData.monthlyAllowance} onChange={handleChange} disabled={!isEditing} />

                        <label>Family Monthly Income</label>
                        <select name="familyMonthlyIncome" value={formData.familyMonthlyIncome} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select Income Range</option>
                            {["Less than P12,030", "P12,031 - P24,060", "P24,061 - P48,120", "P48,121 - P84,210", "P84,211 - P144,360", "P144,361 - P240,600", "More than P240,601"].map((income) => (
                                <option key={income} value={income}>{income}</option>
                            ))}
                        </select>

                        <div>
                            <label>Are you a recipient of any Scholarship/Grants?</label>
                            <label><input type="radio" name="hasScholarship" value={true} checked={formData.hasScholarship === true} onChange={handleChange} disabled={!isEditing} /> Yes</label>
                            <label><input type="radio" name="hasScholarship" value={false} checked={formData.hasScholarship === false} onChange={handleChange} disabled={!isEditing} /> No</label>
                        </div>

                        <div>
                            <label>Do you have a job/business?</label>
                            <label><input type="radio" name="hasJobOrBusiness" value={true} checked={formData.hasJobOrBusiness === true} onChange={handleChange} disabled={!isEditing} /> Yes</label>
                            <label><input type="radio" name="hasJobOrBusiness" value={false} checked={formData.hasJobOrBusiness === false} onChange={handleChange} disabled={!isEditing} /> No</label>
                        </div>

                        <label>Meal Preferences</label>
                        <select name="mealPreferences" value={formData.mealPreferences} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select meal preferences</option>
                            {["I cook my meals", "I eat out regularly", "I buy pre-packaged food", "Combination of three"].map((meal) => (
                                <option key={meal} value={meal}>{meal}</option>
                            ))}
                        </select>

                        <label>Preferred Payment Method (when spending)</label>
                        <select name="preferredPaymentMethod" value={formData.preferredPaymentMethod} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select meal preferences</option>
                            {["Cash", "Online Payment", "Bank Transfer", "Combination of the three"].map((payment) => (
                                <option key={payment} value={payment}>{payment}</option>
                            ))}
                        </select>

                        <label>Frequency of Going Home every Semester</label>
                        <select name="frequencyGoingHomePerSemester" value={formData.frequencyGoingHomePerSemester} onChange={handleChange} disabled={!isEditing}>
                            <option value="">Select frequency of going home</option>
                            {["Not at all", "Rarely", "Sometimes", "Often", "Always"].map((freq) => (
                                <option key={freq} value={freq}>{freq}</option>
                            ))}
                        </select>

                        <div>
                            <label>Do you have Health Concerns?</label>
                            <label><input type="radio" name="hasHealthConcerns" value={true} checked={formData.hasHealthConcerns === true} onChange={handleChange} disabled={!isEditing} /> Yes</label>
                            <label><input type="radio" name="hasHealthConcerns" value={false} checked={formData.hasHealthConcerns === false} onChange={handleChange} disabled={!isEditing} /> No</label>
                            
                        </div>

                        <div>
                            <label>If yes, specify:</label>
                            <input 
                                id="healthConcernDetails" 
                                type="text" 
                                name="healthConcernDetails" 
                                value={formData.healthConcernDetails || ""}  
                                onChange={handleChange} 
                                disabled={!isEditing} 
                            />
                        </div>
                        
                        

                        {/* Expenses */}
                        <h3>Your Monthly Expenses</h3>

                        {[
                            { id: "livingExpense", label: "Living Expense" },
                            { id: "foodDiningExpense", label: "Food & Dining Expense" },
                            { id: "transportationExpense", label: "Transportation Expense" },
                            { id: "leisureEntertainmentExpense", label: "Leisure & Entertainment Expense" },
                            { id: "academicExpense", label: "Academic Expense" },
                        ].map(({ id, label }) => (
                            <div key={id} className="form-group">
                                <label htmlFor={id}>{label}</label>
                                <input id={id} type="number" name={id} value={formData[id]} onChange={handleChange} disabled={!isEditing} />
                            </div>
                        ))}

                        <div>
                            <label>Do you track your expenses through excel/spreadsheets before/now?</label>
                            <label><input type="radio" name="hasTrackExpensesBefore" value={true} checked={formData.hasTrackExpensesBefore === true} onChange={handleChange} disabled={!isEditing} /> Yes</label>
                            <label><input type="radio" name="hasTrackExpensesBefore" value={false} checked={formData.hasTrackExpensesBefore === false} onChange={handleChange} disabled={!isEditing} /> No</label>
                            
                        </div>


                        {/* Buttons */}
                        <div className="modal-buttons">
                            {isEditing ? (
                                <>
                                    <button type="submit">{isNewFeature ? "Add" : "Save"}</button>
                                    {!isNewFeature && <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>}
                                </>
                            ) : (
                                <button type="button" onClick={() => setIsEditing(true)}>Edit</button>
                            )}
                            <button type="button" onClick={() => onClose()}>Close</button>
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
    feature: PropTypes.object
};

export default FeatureModal;
