const axios = require('axios');
const db = require('../db');
const crypto = require('node:crypto');
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
//hash gerate key 
/**
 * Generates a SHA-512 hash using an API Key and a Timestamp.
 * @param {string|number} ts - The current timestamp.
 * @param {string} apiKey - The unique API key.
 * @returns {string} - The hex-encoded hash string.
 */
function generateKeyHash(ts, apiKey) {
    // Ensure both inputs are treated as strings
    const dataToHash = String(apiKey) + String(ts);
    
    return crypto
        .createHash('sha512')
        .update(dataToHash)
        .digest('hex');
}
/**
 * Generates an HMAC-SHA512 signature.
 * @param {Object} body - The JSON payload from Tally/Client.
 * @param {string} apiKey - The secret API Key.
 */
function generateHmacSignature(data, key) {
    const crypto = require('crypto');
    return crypto.createHmac('sha512', key) // Or 'sha256' depending on your API docs
                 .update(data)
                 .digest('hex');
}
// --- Controller Object ---
const Nic__Controller = {
    index: async (req, res) => {
        const { licKey, serialKey, ownerCode, apiType } = req.params;
        try {
            
            // 1. Database Validation: Find Customer
            const [rows] = await db.query(
                'SELECT DB_Cust__Id, DBApiKey, DB_ApiKey, DB__clientsecret,DB_Cust__SathiCurrentStatus, DB_Cust__AMCExpired FROM db_tbl__customerdetails WHERE DB_Cust__SerialKey = ? AND DB_Cust__LicNo = ?',
                [serialKey, ownerCode]
            );

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    statusCodec: 404,
                    Status: "Error",
                    Message: "Authorization Failed!",
                    data: { statusCode: 404, status: "Error", message: "Invalid Serial or License", data: [] }
                });
            }

            const { DB_Cust__Id: CustId, DBApiKey: SugApiKey, DB__clientsecret:clientsecret, DB_Cust__AMCExpired: sathiAMCExpired, DB_Cust__SathiCurrentStatus: sathiCurrentStatus, DB_ApiKey: apiKey } = rows[0];

            // 2. Database Validation: API Key Pair
            const [rows_Key_Validate] = await db.query(
                'SELECT DB_Cust__Id FROM tbl_api_key WHERE DB_Cust__Id = ? AND Api_Key = ?',
                [CustId, licKey + SugApiKey]
            );

            if (!rows_Key_Validate || rows_Key_Validate.length === 0) {
                return res.status(401).json({
                    statusCodec: 401,
                    Status: "Error",
                    Message: "Authorization Failed!",
                    data: { statusCode: 401, status: "Error", message: "Invalid API Key Combination", data: [] }
                });
            }

            // 3. Status/AMC Check
            if (sathiAMCExpired !== '1' && (sathiCurrentStatus === 'Live' || sathiCurrentStatus === 'Demo')) {
                const msg = (sathiCurrentStatus === 'Live') ? "Your AMC has Expired!" : "Your Demo Period has Expired!";
                return res.status(403).json({
                    statusCodec: 403,
                    Status: "Error",
                    Message: "Subscription Error",
                    data: { statusCode: 403, status: "Error", message: msg, data: [] }
                });
            }

            // 4. Input Processing
            const jsonInputRaw = req.query._dataToJson;
            if (!jsonInputRaw) {
                return res.status(400).json({
                    statusCodec: 400,
                    Status: "Error",
                    Message: "Bad Request",
                    data: { statusCode: 400, status: "Error", message: "Missing _dataToJson parameter", data: [] }
                });
            }

            const cleaned = cleanJsonInput(jsonInputRaw);
            let dataArray;
            try {
                dataArray = JSON.parse(cleaned);
            } catch (e) {
                return res.status(400).json({
                    statusCodec: 400,
                    Status: "Error",
                    Message: "JSON Parse Error",
                    data: { statusCode: 400, status: "Error", message: "Invalid format in _dataToJson", data: [] }
                });
            }

            // 5. External API Call
            //const finalPayload = { apiKey, ...dataArray };
            // 2. Generate the timestamp and call your function
            let ts = Date.now(); 
            let keyHash = generateKeyHash(ts, apiKey); // <--- CALLING HERE
           
           const finalPayload = {
                keyHash: keyHash,
                ts: ts,
                ...dataArray
            };

            // 2. IMPORTANT: Generate signature using the JSON string 
            // standard practice is to sign the exact string being sent
           const payloadString = JSON.stringify(finalPayload);
            let signature = generateHmacSignature(payloadString, apiKey);
            // Define clientSecret based on ownerCode
            
            // 3. Prepare headers
            const customHeaders = {                  
                "clientid": ownerCode,          
                "clientsecret": clientsecret, // Now using the variable
                "signature": signature,
                "Content-Type": "application/json"
            };
            const targetUrl = determineUrl(apiType);

            // Debugging: Log exactly what is being sent
            //console.log("FINAL PAYLOAD STRING:", payloadString);
            //console.log("GENERATED SIGNATURE:", signature);

            const response = await axios.post(`https://${targetUrl}`, payloadString, {
                headers: customHeaders
                //timeout: 10000 // 2000ms is too short for NIC servers, use 5000ms
            });

            // 6. Success Response (Handling Hybrid Format)
                const nicData = response.data.data || response.data;

                // If it's not an array, wrap it in one to keep logic consistent
                const dataEArray = Array.isArray(nicData) ? nicData : [nicData];

                const finalResponse = dataEArray.map((item, index) => {
                    // For the FIRST item: add the status, message, and statusCode headers
                    if (index === 0) {
                        return {
                            statusCode: 200,
                            Status: "Success",
                            Message: "Request processed successfully",
                            data: {
                                statusCode: response.data.statusCode || 200,
                                status: response.data.status || "Success",
                                message: response.data.message || "Order details fetched successfully",
                                ...item // Spread the properties of the 1st item
                            }
                        };
                    }
                    // For ALL OTHER items: return the object as it is
                    return item;
                });

                // Note: If you want these as separate objects in one JSON response, 
                // they must be wrapped in a parent array to be valid JSON.
                return res.status(200).json(finalResponse);

        } catch (error) {
            // 7. Global Catch / Upstream Error Handling
            const status = error.response?.status || 500;
            return res.status(status).json({
                statusCodec: status,
                Status: "Error",
                Message: `Request  failed with status code ${status }`,
                //Message: error.response.data.message ,
                data: error.response?.data || {
                    statusCode: status,
                    status: "Error",
                    message: error.message
                }
            });
        }
    }
};

module.exports = Nic__Controller;
