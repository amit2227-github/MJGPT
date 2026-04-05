import Transcation from "../models/Transcation";

const plans =[
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
];


//Api controller for getting all plans
export const getPlansController = async (req, res) => {
    try {
        res.json({
            success: true,
            plans
        });
    } catch (error) {
        res.json({
            success: false, 
            message: error.message
        });
    }
}

//Api controller for purchasing a plan
export const purchasePlanController = async (req, res) => {
    try {
        const userId = req.user._id || req.user;
        const { planId } = req.body;
        const plan = plans.find(plan => plan._id === planId);
        if (!plan) {
            return res.json({
                success: false,
                message: "Invalid plan selected"
            });
        } catch (error) {
            res.json({
                success: false,
                message: error.message
            });
        }
    }
}