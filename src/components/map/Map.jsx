import React, { useContext, useMemo, useState, useRef, useEffect } from "react";
import styles from "./Map.module.css";
import { AuthContext } from "../store/AuthContext";
import {
  useLoadScript,
  GoogleMap,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { InfoWindow } from "@react-google-maps/api";
import { Tooltip, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CountryLatLong from "./CountryLatLong";
import CardMedia from "@mui/material/CardMedia";
import { Box } from "@mui/material";
import speed from "../resources/speed.png";
import codes from "./Codes";
import InfoCard from "./InfoCard";

import {
  flightIcon,
  flightLandIcon,
  flightTakeOffIcon,
  airportIcon,
} from "../resources/flightIcons";
import customMap from "../common/customMap";

const altitudeStateLimit = 1000;

const getIconName = (isOnGround, verticalRate, altitude, trueTrack) => {
  if (isOnGround) return "flightIcon";

  if (altitude <= 0) return "flightIcon";

  if (verticalRate > 0 && altitude < altitudeStateLimit)
    if (trueTrack < 180) return "flightTakeOffIcon";
    else return "flightTakeOffFlippedIcon";

  if (verticalRate < 0 && altitude < altitudeStateLimit)
    if (trueTrack < 180) return "flightLandIcon";
    else return "flightLandFlippedIcon";

  return "flightIcon";
};

const getIcon = (isOnGround, verticalRate, altitude) => {
  if (isOnGround) return flightIcon;

  if (altitude <= 0) return flightIcon;

  if (verticalRate > 0 && altitude < altitudeStateLimit)
    return flightTakeOffIcon;

  if (verticalRate < 0 && altitude < altitudeStateLimit) return flightLandIcon;

  return flightIcon;
};

const getColor = (altitude) => {
  var percent = (altitude / 13000) * 100;
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  var r,
    g,
    b = 0;
  if (percent < 50) {
    r = 255;
    g = Math.round(5.1 * percent);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * percent);
  }

  var h = r * 0x10000 + g * 0x100 + b * 0x1;

  return "#" + ("000000" + h.toString(16)).slice(-6);
};

const getRotation = (trueTrack, verticalRate, altitude) => {
  if (verticalRate > 0 && altitude < altitudeStateLimit) return 0.0;

  if (verticalRate < 0 && altitude < altitudeStateLimit) return 0.0;

  return trueTrack;
};

const Map = ({ flights, time, centre, airports, setAirports }) => {
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [currPoly, setCurrPoly] = useState(null);
  const [selectedAiport, setSelectedAirport] = useState(null);
  const [destPoly, setDestPoly] = useState(null);
  const [infoData, setInfoData] = useState(null);
  const [arrData, setArrData] = useState(null);
  const [depData, setDepData] = useState(null);

  const polyline = useRef();
  const fetchCoordinates = async (flightNo, color) => {
    console.log(polyline.current);
    try {
      const response = await fetch(
        `https://opensky-network.org/api/tracks/all?icao24=${flightNo}&time=${
          time ? time : 0
        }`
      );
      let data = await response.json();
      console.log(data);
      const waypoints = data.path.map((point) => {
        return { lat: point[1], lng: point[2] };
      });
      setCoordinates(waypoints);
      console.log(waypoints);
      setCurrPoly({
        flightNo: flightNo,
        color: color,
      });
      console.log(flightNo);
      const response2 = await fetch(
        `https://airlabs.co/api/v9/flights?api_key=${process.env.REACT_APP_AIRPORT_KEY}&hex=${flightNo}`
      );
      const destData = await response2.json();
      setInfoData(destData);
      const destIata = destData.response[0].arr_iata;
      const depIata = destData.response[0].dep_iata;

      const depResp = await fetch(
        `https://airlabs.co/api/v9/airports?iata_code=${depIata}&api_key=${process.env.REACT_APP_AIRPORT_KEY}`
      );
      let depdata = await depResp.json();
      setDepData(depdata);
      const destResp = await fetch(
        `https://airlabs.co/api/v9/airports?iata_code=${destIata}&api_key=${process.env.REACT_APP_AIRPORT_KEY}`
      );
      let adata = await destResp.json();
      setArrData(adata);
      let airportInfo = adata.response[0];
      if (airportInfo) {
        console.log(airportInfo);
        setAirports((prev) => [...prev, airportInfo]);
        setDestPoly([
          waypoints[waypoints.length - 1],
          { lat: airportInfo.lat, lng: airportInfo.lng },
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAP_KEY,
  });

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedCentre(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
  return (
    <div className={styles.container}>
      {!isLoaded ? (
        <h1>Loading..</h1>
      ) : (
        <GoogleMap
          options={{
            styles: customMap,
            disableDefaultUI: true,
            minZoom: 3,
          }}
          onClick={() => {
            setSelectedAirport(null);
            setArrData(null);
            setDepData(null);
            setInfoData(null);
            setSelectedCentre(null);
          }}
          mapContainerClassName={styles.mapContainer}
          center={centre}
          zoom={5}
        >
          console.log(flights)
          {flights.map((flight) => {
            if (flight[6] && flight[5]) {
              var altitude = flight[7];
              if (altitude === null || altitude < 0) altitude = flight[7];
              if (altitude === null || altitude < 0) altitude = 0;
              const velocity = flight[9] ? flight[9] * 3.6 : -1;

              // Get true track
              const trueTrack = flight[10] ? flight[10] : 0.0;

              // Get vertical rate
              const verticalRate = flight[11] ? flight[11] : 0.0;

              // Get is on ground
              const isOnGround = flight[8];

              const centre = {
                lat: flight[6],
                lng: flight[5],
              };
              const code = codes[flight[2]].toLowerCase();

              const icon = getIcon(isOnGround, verticalRate, altitude);
              const color = getColor(altitude);
              const rotation = getRotation(trueTrack, verticalRate, altitude);

              return (
                <>
                  <Marker
                    key={flight[0]}
                    position={{ lat: flight[6], lng: flight[5] }}
                    icon={{
                      path: icon,
                      scale: 1,
                      fillColor: color,
                      fillOpacity: 1,
                      rotation: rotation,
                      strokeOpacity: 0,
                    }}
                    onClick={() => {
                      fetchCoordinates(flight[0], color);
                      setSelectedCentre({
                        ...centre,

                        code,

                        dir: flight[11],
                        color: color,
                      });
                    }}
                  />
                </>
              );
            }
          })}
          {selectedCentre && (
            <InfoWindow
              onCloseClick={() => {
                setSelectedAirport(null);
                setArrData(null);
                setDepData(null);
                setInfoData(null);
                setSelectedCentre(null);
              }}
              position={{
                lat: selectedCentre.lat,
                lng: selectedCentre.lng,
              }}
              zIndex={1000}
            >
              <InfoCard
                code={selectedCentre.code}
                dir={selectedCentre.dir}
                color={selectedCentre.color}
                infoData={infoData}
                arrData={arrData}
                depData={depData}
              />
            </InfoWindow>
          )}
          {/* );
            }
          })} */}
          {airports.map((airport) => (
            <Marker
              onClick={() => {
                console.log({
                  lat: airport.lat,
                  lng: airport.lng,
                  name: airport.name,
                });
                setSelectedAirport({
                  lat: airport.lat,
                  lng: airport.lng,
                  name: airport.name,
                  country: airport.country_code.toLowerCase(),
                });
              }}
              key={airport["iata_code"]}
              // label={{text: airport.name,className: styles.airportLabel,color: '#000000'}}
              position={{ lat: airport.lat, lng: airport.lng }}
              icon={{
                path: airportIcon,
                scale: 0.1,
                fillColor: `#829FFF`,
                fillOpacity: 1,
                strokeOpacity: 0,
              }}
            />
          ))}
          {selectedAiport && (
            <InfoWindow
              onCloseClick={() => {
                setSelectedCentre(null);
                setSelectedAirport(null);
              }}
              position={{
                lat: selectedAiport.lat,
                lng: selectedAiport.lng,
              }}
              zIndex={1000}
            >
              <Card sx={{ display: "flex", padding: 0 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: 0,
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    src={`https://flagcdn.com/48x36/${selectedAiport.country}.png`}
                    alt={selectedAiport.city}
                    width="21px"
                    height="14px"
                    style={{ marginRight: "10px" }}
                  />
                  <b>{selectedAiport.name}</b>
                </CardContent>
              </Card>
            </InfoWindow>
          )}
          {currPoly && (
            <Polyline
              path={coordinates}
              id={currPoly.flightNo}
              // strokeColor="#FF0000"
              // strokeOpacity={0.8}
              // strokeWeight={2}
              // fillColor="#FF0000"
              options={{
                geodesic: true,
                strokeColor: currPoly.color,
                strokeOpacity: 0.5,
                strokeWeight: 3,
                icons: [
                  {
                    icon: {
                      path: "M 0,0 0,1",
                      strokeOpacity: 1,
                      strokeWeight: 2,
                      scale: 3,
                      strokeColor: "#FFFFFF",
                    },
                    repeat: "10px",
                  },
                ],
              }}
              ref={polyline}
            />
          )}
          {destPoly && (
            <Polyline
              path={destPoly}
              id={Math.random().toString()}
              options={{
                geodesic: true,
                strokeColor: "#859CE7",
                strokeOpacity: 0.8,
                strokeWeight: 3,
                icons: [
                  {
                    icon: {
                      path: "M 0,0 0,1",
                      strokeOpacity: 1,
                      strokeWeight: 2,
                      scale: 3,
                      strokeColor: "#FFFFFF",
                    },
                    repeat: "10px",
                  },
                ],
              }}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default Map;
