import React, { useState, useEffect, useCallback } from "react";
import FilterInput from "../components/FilterInput";
import EventTable from "../components/EventTable";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";

const Home = () => {
  const [events, setEvents] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = useCallback(async (token) => {
    try {
      console.log("Using token:", token);
      const response = await axios.get("/calendar", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      console.log("Error response:", error.response);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      console.log("Token from URL:", token);
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/home");
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      console.log("No token found in localStorage");
      navigate("/");
      return;
    }

    fetchEvents(storedToken);
  }, [fetchEvents]);

  const logoutHandler = useCallback(async () => {
    try {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [navigate]);

  const handleFilter = useCallback((date) => {
    if (!events) return;

    if (!date) {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter((event) =>
        event.startDate.startsWith(date)
      );
      setFilteredEvents(filtered);
    }
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Google Calendar Events
          </h1>
          <button
            onClick={logoutHandler}
            className="bg-red-600 hover:bg-red-700 transition-colors text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <FilterInput onFilter={handleFilter} />
          </div>
          
          <div className="p-6">
            {filteredEvents ? (
              <EventTable events={filteredEvents} />
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                <span className="ml-3 text-slate-600">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;