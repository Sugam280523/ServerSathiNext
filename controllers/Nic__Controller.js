const axios = require('axios');

// --- Helper Functions ---
function cleanJsonInput(input) {
    if (!input) return "{}";
    // 1. Decode URL (converts %7B to { etc.)
    let str = decodeURIComponent(input);
    // 2. Remove wrapper quotes if present
    if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
    // 3. Remove slashes and non-printable chars
    str = str.replace(/\\/g, ''); 
    str = str.replace(/[^\x20-\x7E]/g, ''); 
    str = str.replace(/'/g, '"');
    // 4. Clean Tally specific suffix
    const pos = str.indexOf('RESPONCE:');
    if (pos !== -1) str = str.substring(0, pos);
    return str.trim();
}

function determineUrl(apiType) {
    const routes = {
        "PPI": "demo.seedtrace.nic.in/inv-apis/billing/getOrderDetailsByBuyerCode",
        "PCI": "demo.seedtrace.nic.in/inv-apis/billing/pullLotDetailsByBuyerCode",
        "PGI": "demo.seedtrace.nic.in/inv-apis/billing/fetchLotDetailsByBuyerCode"
    };
    // Default URL if apiType doesn't match
    return routes[apiType] || "demo.seedtrace.nic.in/inv-apis/billing/createSathiOrder";
}

// --- Controller Object ---
const Nic__Controller = {
    index: async (req, res) => {
        try {
            // A. Extract Path Params
            const { serialKey, licNo, ownerCode, apiType } = req.params;

            // B. Extract Query Param (?_dataToJson=...)
            const jsonInputRaw = req.query._dataToJson;

            if (!jsonInputRaw) {
                return res.status(400).json({ Status: "Error", Message: "Missing _dataToJson parameter" });
            }

            // C. Hardcoded API Key (as per your request)
            const apiKey = '01702ded02cf9932866f5678373e693fc38fba71e90bdd9de734132943d42167';

            // D. Parse & Clean JSON
            const cleaned = cleanJsonInput(jsonInputRaw);
            let dataArray;
            try {
                dataArray = JSON.parse(cleaned);
            } catch (e) {
                return res.status(400).json({ Status: "Error", Message: "Invalid JSON format in _dataToJson" });
            }
            
            // E. Merge API Key with the Data
            const finalPayload = { apiKey, ...dataArray };

            // F. Forward Request to NIC
            const targetUrl = determineUrl(apiType);
            const response = await axios.post(`https://${targetUrl}`, finalPayload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 20000
            });

            // G. Send Upstream Response back to Client
            return res.status(200).json(response.data);

        } catch (error) {
            console.error("NIC API Proxy Error:", error.message);
            return res.status(error.response?.status || 500).json({
                statusCodec: error.response?.status || 500,
                Status: "Error",
                Message: error.message,
                Data: error.response?.data || ""
            });
        }
    }
};

module.exports = Nic__Controller;