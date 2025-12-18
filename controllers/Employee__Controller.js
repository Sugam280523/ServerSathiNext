// controllers/Employee__Controller.js

const Employee__Controller = {
    index: (req, res) => {
        res.send("Employee Registration Page");
    },
    Employee__Update: (req, res) => {
        res.send("Employee Update API");
    },
    Employee__Table: (req, res) => {
        res.send("Employee Table View");
    },
    Employee__Table__GetData: (req, res) => {
        res.json({ status: "success", data: [] });
    },
    Change__Employee__Status: (req, res) => {
        res.json({ status: "success", message: "Status Changed" });
    }
};

module.exports = Employee__Controller;