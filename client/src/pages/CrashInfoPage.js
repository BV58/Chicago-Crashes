import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import VehicleInfo from "../components/VehicleInfo";
import config from "../config";
import GoogleMap from "../components/GoogleMap.js";

export default function CrashInfoPage() {
  const { crash_id } = useParams();

  // Crash Info
  const [location, set_location] = useState("");
  const [date, set_date] = useState("");
  const [time, set_time] = useState("");
  const [crash_type, set_crash_type] = useState("");
  const [prim_cause, set_prim_cause] = useState("");
  const [sec_cause, set_sec_cause] = useState("");
  const [damage_value, set_damage_value] = useState("");
  const [posted_speed_limit, set_posted_speed_limit] = useState("");
  const [traffic_control_device, set_traffic_control_device] = useState("");
  const [longitude, set_longitude] = useState("");
  const [latitude, set_latitude] = useState("");

  // Conditions
  const [weather_condition, set_weather_condition] = useState("");
  const [lighting_condition, set_lighting_condition] = useState("");
  const [roadway_surface_cond, set_roadway_surface_cond] = useState("");
  const [road_defect, set_road_defect] = useState("");

  // Injuries
  const [injury_type, set_injury_type] = useState("");
  const [injuries_total, set_injuries_total] = useState("");
  const [fatal_injuries, set_fatal_injuries] = useState("");
  const [incapacitating_injuries, set_incapacitating_injuries] = useState("");
  const [unknown_injuries, set_unknown_injuries] = useState("");
  const [vehicles, setVehicles] = useState([]);

  // Query database and update states
  const base = `http://${config.server_host}:${config.server_port}`;

  useEffect(() => {
    const controller = new AbortController();
    let retry = false;

    const fetchCrashAndVehicles = async () => {
      try {
        const [crashRes, vehiclesRes] = await Promise.all([
          fetch(`${base}/crash_record_id/${encodeURIComponent(crash_id)}`, {
            signal: controller.signal,
          }).then((res) => res.json()),
          fetch(`${base}/vehicles/${encodeURIComponent(crash_id)}`, {
            signal: controller.signal,
          }).then((res) => res.json()),
        ]);

        setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);

        const data =
          Array.isArray(crashRes) && crashRes.length > 0 ? crashRes[0] : null;

        if (!data) {
          if (!retry) {
            retry = true;
            console.warn("Retrying fetch for crash data");
            return fetchCrashAndVehicles();
          } else {
            console.warn("No crash data found after retry");
            return;
          }
        }

        set_location(
          [data.street_direction, data.street_no, data.street_name]
            .filter(Boolean)
            .join(" ")
        );

        const crashDate = new Date(data.crash_date);
        set_date(crashDate.toLocaleDateString());
        set_time(crashDate.toLocaleTimeString());
        set_crash_type(
          `${data.crash_type || "N/A"}, ${data.first_crash_type || "N/A"}`
        );
        set_prim_cause(data.prim_contributory_cause || "N/A");
        set_sec_cause(data.sec_contributory_cause || "N/A");
        set_damage_value(data.damage || "");
        set_posted_speed_limit(data.posted_speed_limit || "N/A");
        set_traffic_control_device(data.traffic_control_device || "N/A");
        set_weather_condition(data.weather_condition || "N/A");
        set_lighting_condition(data.lighting_condition || "N/A");
        set_roadway_surface_cond(data.roadway_surface_condition || "N/A");
        set_road_defect(data.road_defect || "N/A");
        set_latitude(data.latitude);
        set_longitude(data.longitude);
        set_injury_type(data.injury_type || "N/A");
        set_injuries_total(data.injuries_total);
        set_fatal_injuries(data.injuries_fatal);
        set_incapacitating_injuries(data.injuries_incapacitating);
        set_unknown_injuries(data.injuries_unknown);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching crash data:", err);
        }
      }
    };

    fetchCrashAndVehicles();

    return () => controller.abort();
  }, [crash_id]);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Crash Information
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Section title="Crash Info">
            <Info label="Crash ID" value={crash_id} />
            <Info label="Location" value={location} />
            <Info label="Date" value={date} />
            <Info label="Time" value={time} />
            <Info label="Crash Type" value={`${crash_type}`} />
            <Info label="Primary Cause" value={prim_cause} />
            <Info label="Secondary Cause" value={sec_cause} />
            <Info label="Damage" value={damage_value} />
            <Info label="Speed Limit" value={posted_speed_limit} />
            <Info
              label="Traffic Control Device"
              value={traffic_control_device}
            />
          </Section>

          <Section title="Conditions">
            <Info label="Weather" value={weather_condition} />
            <Info label="Lighting" value={lighting_condition} />
            <Info label="Roadway Surface" value={roadway_surface_cond} />
            <Info label="Road Defect" value={road_defect} />
          </Section>

          <Section title="Injuries">
            <Info label="Injury Type" value={injury_type} />
            <Info label="Total Injuries" value={injuries_total} />
            <Info label="Fatal Injuries" value={fatal_injuries} />
            <Info
              label="Incapacitating Injuries"
              value={incapacitating_injuries}
            />
            <Info label="Unknown Injuries" value={unknown_injuries} />
          </Section>
        </Grid>
        <Grid item xs={12} md={6}>
          <Section title="Crash Location">
            {latitude && longitude ? (
              <GoogleMap lat={latitude} lng={longitude} height="250px" />
            ) : (
              <Typography>No location available</Typography>
            )}
          </Section>

          <Section title="Vehicles Involved">
            {vehicles.length === 0 ? (
              <Typography>No vehicles found.</Typography>
            ) : (
              vehicles.map((vehicle, idx) => (
                <Box key={idx} mb={2}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <VehicleInfo vehicle={vehicle} />
                  </Paper>
                </Box>
              ))
            )}
          </Section>
        </Grid>
      </Grid>
    </Container>
  );
}

function Info({ label, value }) {
  return (
    <Box display="flex" alignItems="start" mb={1}>
      <Typography
        variant="body1"
        fontWeight={500}
        sx={{ minWidth: 178, mr: 1 }}
      >
        <strong>{label}:</strong>
      </Typography>

      <Typography variant="body1" sx={{ wordBreak: "break-word", flex: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        {title}
      </Typography>
      <Paper elevation={1} sx={{ p: 2 }}>
        {children}
      </Paper>
    </Box>
  );
}
