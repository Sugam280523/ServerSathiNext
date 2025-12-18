// controllers/Customer__Controller.js

const Customer__Controller = {
    index: (req, res) => {
        res.send("Customer Index Page");
    },
    CustomerLead__Table: (req, res) => {
        res.send("Lead Table Page");
    },
    CustomerLead__Table__GetData: (req, res) => {
        res.json({ status: "success", data: [] });
    },
    // Add other functions as needed for your routes
};

module.exports = Customer__Controller;