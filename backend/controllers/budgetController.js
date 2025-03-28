const Budget = require('../models/BudgetModel');
const mongoose = require('mongoose');

// Route: api/budgets/ : get all budget by user
// Method: GET
// Request:
//   axios.get(`${import.meta.env.VITE_API_URL}api/budgets/`,{
//    headers: { "Content-Type": "application/json" },
//    withCredentials: true,
//   })
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     data: [/*array of Budgets*/]
//   }
const getBudgetsByUser = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({success: true, data: budgets});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching budget', error: error.message });
    }
};

// Route: api/budgets/:id : get budget by id
// Method: GET
// Request:
//   axios.get(`${import.meta.env.VITE_API_URL}api/budgets/${id}`,{
//    headers: { "Content-Type": "application/json" },
//    withCredentials: true,
//   })
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     data: {
//         _id,
//         userId,
//         name,
//         amount,
//         spent,
//         earned,
//         startDate,
//         endDate,
//         closed
//     }
//   }
const getBudget = async (req, res) => {
    console.log("GET BUDGET BY ", req.user._id)

    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid budget ID"});
        }

        const budget = await Budget.findById(id);
        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }
        res.status(200).json({success: true, data: budget});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching budget', error: error.message });
    }
};

// Route: api/budgets/ : Create new budget
// Method: POST
// Request:
//   axios.post(`${import.meta.env.VITE_API_URL}api/budgets/`,
//   {
//     userId: auth._id,
//     name: 'Budget 1',
//     amount: 5000,
//     spent: 0,
//     earned: 0, 
//     startDate: new Date(startDate).toISOString().split("T")[0],
//     endDate: new Date(endDate).toISOString().split("T")[0],
//     closed: false
//   },
//  {withCredentials: true})
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     message: 'Budget created successfully'
//        data: {
//         _id,
//         userId,
//         name,
//         amount,
//         spent,
//         earned,
//         startDate,
//         endDate,
//         closed
//     }
//   }

const createBudget = async (req, res) => {
    try {
        const { userId, name, amount, spent, earned, startDate, endDate, closed } = req.body;
        if (!userId || !name || amount<0 || spent<0 || earned<0 || !startDate || !endDate || (closed == null)) {
            return res.status(400).json({ success: false, message: "Required fields are missing"});
        }

        const budgetExists = await Budget.findOne({ userId, name, closed: false });
        if (budgetExists){
            return res.status(400).json({ success: false, message: "Budget Name already exists!"});
        }
        
    
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ success: false, message: "Invalid User ID"});
        }
    
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, message: "Start date cannot be after end date"});
        }

        const newBudget = new Budget({
            userId,
            name,
            amount,
            spent,
            earned,
            startDate,
            endDate,
            closed
        });

        const savedBudget = await newBudget.save();

        if (name != "Others"){
            await Budget.findOneAndUpdate({userId, name: "Others"}, { $inc: { amount: amount *  -1 } });
        }
        res.status(201).json({ success: true, message: 'Budget created successfully', data: savedBudget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating budget', error: error.message });
    }
};

// Route: api/budgets/:id : Update existing budget
// Method: PATCH
// Request:
//   axios.patch(`${import.meta.env.VITE_API_URL}api/budgets/${id}`,
//   {
//     userId: auth._id,
//     name: 'Budget 1',
//     amount: 5000, 
//     startDate: new Date(startDate).toISOString().split("T")[0],
//     endDate: new Date(endDate).toISOString().split("T")[0],
//   },
//  {withCredentials: true})
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     message: 'Budget updated successfully'
//        data: {
//         _id,
//         userId,
//         name,
//         amount,
//         spent,
//         earned,
//         startDate,
//         endDate,
//         closed
//     }
//   }
const updateBudget = async (req, res) => {
    console.log("UPDATE BUDGET BY ", req.user._id)

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid budget ID" });
        }
    
        if (req.body.startDate && req.body.endDate) {
            if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
                return res.status(400).json({ success: false, message: "Start date cannot be after end date" });
            }
        }
    
        const updatedBudget = await Budget.findByIdAndUpdate({_id: id}, {
            ...req.body
        }, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedBudget) {
            return res.status(404).json({ success: false, error: "Budget not found" });
        }

        res.status(200).json({ success: true, message: 'Budget updated successfully', data: updatedBudget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating budget', error: error.message });
    }
};

// Route: api/budgets/close/:id : Update existing budget
// Method: PATCH
// Request:
//   axios.patch(`${import.meta.env.VITE_API_URL}api/budgets/close/${id}`,
//  {withCredentials: true})
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     message: 'Budget closed successfully'
//   }
const closeBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid budget ID" });
        }        

        //Set closed to true
        const budget = await Budget.findByIdAndUpdate({_id: id}, {closed: true})
        if (!budget) {
            return res.status(404).json({  success: false, error: "Budget not found" });
        }

        res.status(200).json({ success: true, message: 'Budget closed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting budget', error: error.message });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Invalid budget ID" });
        }        

        //Set closed to true
        const deletedBudget = await Budget.findByIdAndDelete(id)

        if (!deletedBudget){
            return res.status(404).json({ error: "Budget not found" });
        }
        res.status(200).json({ success: true, message: 'Budget deleted successfully', data: deletedBudget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting budget', error: error.message });
    }
};

const updateBudgetAmountById = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid budget ID"});
        }

        const updatedBudget = await Budget.findByIdAndUpdate({_id: id}, {
            $inc: {amount} 
        }, { 
            new: true, 
            runValidators: true 
        });
        if (!updatedBudget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }
        res.status(200).json({ success: true, message: 'Budget amount updated successfully', data: updatedBudget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating Others budget', error: error.message });
    }
}
// Route: api/budgets/openBudgets : get all open budget by user
// Method: GET
// Request:
//   axios.get(`${import.meta.env.VITE_API_URL}api/budgets/openBudgets`,
//  {withCredentials: true})
// Response:
//   {
//     success: /* true or false, whether operation succeeded */
//     message: "All open budgets successfully fetched"
//     data: [/* array of open budgets */]
//   }
const getOpenBudgets = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming auth middleware sets req.user
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const budgets = await Budget.find({ userId, closed: false }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: "All open budgets successfully fetched", data: budgets });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching open budgets", error: error.message });
    }
};

const getBudgetByName = async (req, res) => {
    try {
        const { name } = req.params;
        const userId = req.user._id;
        console.log(name)       
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const budget = await Budget.findOne({ userId, name });
        if (!budget) {
            return res.status(400).json({ success: false, message: "Budget not found" }); // 🛑 Add return here
        }

        return res.status(200).json({ success: true, message: "Budget successfully fetched", data: budget });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching budget", error: error.message });
    }
};



module.exports = {
    getBudgetsByUser,
    getBudget,
    createBudget,
    updateBudget,
    closeBudget,
    getOpenBudgets,
    deleteBudget,
    getBudgetByName,
    updateBudgetAmountById
};
