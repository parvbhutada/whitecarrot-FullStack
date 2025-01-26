const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const passport = require("passport");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("./auth");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.SESSION_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification error:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.get("/login", (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar.events.readonly",
    ],
    prompt: "consent",
  })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    console.log("User authenticated:", req.user);
    const token = jwt.sign(
      {
        id: req.user.profile.id,
        accessToken: req.user.accessToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.redirect(`${process.env.FRONTEND_URL}/home?token=${token}`);
  }
);

app.get("/auth/success", isLoggedIn, (req, res) => {
  const token = jwt.sign(
    { id: req.user.profile.id },
    process.env.SESSION_SECRET,
    { expiresIn: "24h" }
  );
  res.json({
    token,
    user: {
      id: req.user.profile.id,
      name: req.user.profile.displayName,
      email: req.user.profile.email,
    },
  });
});

app.get("/auth/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get("/calendar", authenticateToken, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;

    if (!accessToken) {
      console.error("No access token found");
      return res.status(401).json({ error: "No access token available" });
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/google/callback`
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const formattedEvents = events.data.items.map((event) => {
      const start = event.start.dateTime || event.start.date;
      const location = event.location || "No location specified";

      let startDate, startTime;
      if (event.start.dateTime) {
        const date = new Date(event.start.dateTime);
        startDate = date.toISOString().split("T")[0];
        startTime = date.toISOString().split("T")[1].substring(0, 8);
      } else {
        startDate = event.start.date;
        startTime = "All-day event";
      }

      return {
        name: event.summary || "No title",
        startDate: startDate,
        startTime: startTime,
        location: location,
      };
    });

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).send("Failed to fetch calendar events");
  }
});

app.get("/auth/failure", (req, res) => {
  res.send("Authentication failed. Please try again.");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on Port 3000");
});