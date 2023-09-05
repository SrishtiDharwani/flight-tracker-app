import Navbar from "./components/Navbar";
import Map from "./components/map/Map";
import "./App.css";
import { useEffect, useState, useCallback } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { deDE } from "@mui/x-date-pickers/locales";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import Loader from "./components/common/Loader";
import { Card, Modal, Button } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import {
  CountryDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import Auth from "./components/Auth";
import { AuthContext } from "./components/store/AuthContext";
import codes from "./components/map/Codes";
import CountryLatLong from "./components/map/CountryLatLong";
import { Toaster } from "react-hot-toast";

const App = () => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(false);
  const [user, setUser] = useState("");
  const [centre, setCentre] = useState({ lat: 20.0, lng: 77.0 });
  const [airports, setAirports] = useState([]);

  const login = useCallback((uid, token, name) => {
    setIsLoggedin(true);

    setToken(token);
    setUserId(uid);
    setUser(name);

    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
      })
    );
    console.log(token);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedin(false);
    setToken(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("India");
  const [searchParam, setSearchParam] = useState({
    time: "",
  });
  const onTimeChange = (value) => {
    const seconds = value.unix();
    setSearchParam((prev) => {
      return { ...prev, time: seconds };
    });
  };
  const theme = createTheme(
    {
      palette: {
        primary: { main: "#1976d2" },
      },
    },
    deDE // use 'de' locale for UI texts (start, next month, ...)
  );
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setIsLoading(true);
        const resp = await fetch(
          `https://opensky-network.org/api/states/all?${
            searchParam.time ? `time=${searchParam.time}` : ""
          }`,
          {
            headers: {
              Authorization:
                "Basic " +
                btoa(
                  `process.env.REACT_APP_OPENSKY_USERNAME:process.env.REACT_APP_OPENSKY_PASSWORD`
                ),
            },
          }
        );
        let data = await resp.json();
        if (country) {
          console.log(country);
          data = data.states.filter((flight) => flight[2] == country);
          const code = codes[country].toLowerCase();
          if (code) {
            const latLong = CountryLatLong[code];
            setCentre({ lat: +latLong[0], lng: +latLong[1] });
            const airResp = await fetch(
              `https://airlabs.co/api/v9/airports?country_code=${code}&api_key=${process.env.REACT_APP_AIRPORT_KEY}`
            );
            const airData = await airResp.json();
            console.log(airData);
            console.log(airData.response);
            setAirports(airData.response);
          }
        } else {
          data = data.states;
        }
        console.log(data);
        setFlights(data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    };
    if (isLoggedin) {
      fetchFlights();
    }
  }, [searchParam, country, isLoggedin]);

  const onCountryChange = (country) => {
    setCountry(country);
  };
  // const currDate = new Date();
  // const prevDate = new Date(currDate);
  const currDate = dayjs();
  const prevDate = currDate.hour(currDate.hour() - 1);
  return (
    <AuthContext.Provider
      value={{ isLoggedIn: isLoggedin, login: login, logout: logout }}
    >
      {/* <Navbar name={user} /> */}
      {!isLoggedin ? (
        <>
          <Navbar name={user} /> <Auth />{" "}
        </>
      ) : (
        <ThemeProvider theme={theme}>
          <Modal open={isLoading}>
            <div className="loaderClass">
              <Loader />
            </div>
          </Modal>
          <div className="datePicker">
            <LocalizationProvider
              localeText={
                deDE.components.MuiLocalizationProvider.defaultProps.localeText
              }
              dateAdapter={AdapterDayjs}
            >
              <TimePicker
                label="Select Time"
                minTime={prevDate}
                maxTime={currDate}
                ampm={false}
                defaultValue={currDate}
                onChange={onTimeChange}
              />
            </LocalizationProvider>
            <CountryDropdown
              value={country}
              onChange={(coun) => onCountryChange(coun)}
              classes="countrySelector"
            />
          </div>
          <Card className="name">
            <h4 className="username">{user}</h4>
            <Button variant="contained" onClick={logout}>
              Log out
            </Button>
          </Card>
          <Map
            flights={flights}
            time={searchParam.time}
            centre={centre}
            airports={airports}
            setAirports={setAirports}
          />
        </ThemeProvider>
      )}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{ duration: 4000 }}
      />
    </AuthContext.Provider>
  );
};

export default App;
