const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get(
  "/crash_severity_index_per_city/:year",
  routes.crash_severity_index_per_city
);
app.get(
  "/top_vehicle_types_in_fatal_crashes_with_avg_age/:vehicle_type",
  routes.top_vehicle_types_in_fatal_crashes_with_avg_age
);
app.get(
  "/driver_age_groups_and_safety_equipment_effectiveness/:safety_equipment",
  routes.driver_age_groups_and_safety_equipment_effectiveness
);
app.get(
  "/safety_equipment_vs_injury_outcomes/:safety_equipment",
  routes.safety_equipment_vs_injury_outcomes
);
app.get(
  "/crashes_by_travel_direction/:year",
  routes.crashes_by_travel_direction
);
app.get(
  "/crashes_per_vehicle_type/:vehicle_type",
  routes.crashes_per_vehicle_type
);
app.get("/average_age_of_vehicle/:vehicle_type", routes.average_age_of_vehicle);
app.get(
  "/total_crashes_and_fatalities/:year",
  routes.total_crashes_and_fatalities
);
app.get(
  "/top_primary_contributory_causes/:year",
  routes.top_primary_contributory_causes
);
app.get("/weather_conditions/:year", routes.weather_conditions);
app.get("/crash_record_id/:crash_record_id", routes.crash_record_id);
app.get("/search_crashes", routes.search_crashes);
app.get("/years", routes.years);
app.get("/vehicle_types", routes.vehicle_types);
app.get("/safety_equipment", routes.safety_equipment);
app.get("/vehicles/:crash_record_id", routes.vehicles_in_crash);

app.get("/types_of_weather_conditions", routes.types_of_weather_conditions);
app.get("/types_of_lighting_conditions", routes.types_of_lighting_conditions);
app.get("/types_of_first_crash_types", routes.types_of_first_crash_types);
app.get("/types_of_roadway", routes.types_of_roadway);
app.get("/types_of_surface_conditions", routes.types_of_surface_conditions);
app.get("/types_of_damage_value", routes.types_of_damage_value);

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});


module.exports = app;
