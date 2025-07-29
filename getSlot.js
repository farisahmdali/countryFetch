const express = require('express');
const cors = require('cors');
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Visa type codes for the 'type' parameter:
 *   Schengen: 0
 *   National: 2
 *   Premium Lounge: 5
 */
async function fetchAvailableSlotsGermany(date, type = 0) {
  const cookieHeader =
    `cookiesession1=678A3E0D9C2DBFF3C54886BAB7A5C77F; org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE=en; auth_token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYXJpc2FobWRhbGkiLCJyb2xlIjoiUk9MRV9BUFBMSUNBTlQiLCJpc3MiOiJndmN3LWFwcCIsImV4cCI6MTc1NDk5NDc1NywiaWF0IjoxNzUzMTk0NzU3LCJqdGkiOiIzODc4NGUxNy1lYjk2LTRkMTUtYTNiMC1jOGU5ODcwODg0MjMifQ.NaDqOqks412pYoyTlrE2rGqGQ5YqWaBu-R9nYK6cBaM; country=EN; language=en;`;

  const body = {
    datefrom: date,
    type,
    bookingfor: 0,
    members: 1,
    method: 1,
    travelpurposes: -1,
    howmanyapplicantsareunder12: 0,
    appointmentId: "undefined",
    id: 0,
    vac: {
      id: 83
    }
  };

  try {
    const response = await axios.put(
      "https://uk-gr-services.gvcworld.eu/api/v1/periodslot/slots",
      body,
      {
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        },
      }
    );
    // If limit exceeded error, return empty array
    console.log(response.data)
    if (
      response?.data?.message &&
      typeof response.data.message === "string" &&
      response.data.message.toLowerCase().includes("limit exceeded")
    ) {
      return [];
    }
    return response?.data?.returnobject?.slots;
  } catch (err) {
    if (err?.response?.data?.message && typeof err.response.data.message === 'string' &&
        err.response.data.message.toLowerCase().includes('limit exceeded')) {
      return [];
    }
    throw err;
  }
}

// GET /hello endpoint
app.get('/hello', (req, res) => {
  res.status(200).json({ message: 'Hello, world!' });
});

// GET /get-slots?date=...&type=...
app.get('/get-slots', async (req, res) => {
  try {
    const { date, type } = req.query;
    // You may want to validate date and type here
    console.log(date, type);
    const slots = await fetchAvailableSlotsGermany(date, type ? Number(type) : 0);
    res.status(200).json({ slots });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
