const { Pool, types } = require("pg");
const config = require("./config.json");

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, (val) => parseInt(val, 10)); //DO NOT DELETE THIS

// Simple cache
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const getCached = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
};

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

//Route: GET /crash_severity_index_per_city
//This query calculates a severity index for each city, showing fatalities relative to crash volume. Cities with a high index have
//deadlier crashes on average, even if their overall crash counts are lower.

const crash_severity_index_per_city = async function (req, res) {
  const year = req.params.year;

  const cacheKey = `crash_severity_index_per_city_${year}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
    SELECT city_name, total_crashes, total_fatalities, severity_index
     FROM mv_city_crash_severity 
     WHERE crash_year = '${year}'
     ORDER BY severity_index DESC
     LIMIT 5;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /top_vehicle_types_in_fatal_crashes_with_avg_age
//This query finds the top five vehicle types most frequently involved in fatal crashes and calculates the average age of their drivers. It
//helps identify whether certain vehicles are linked to fatal incidents and if driver age plays a role.

const top_vehicle_types_in_fatal_crashes_with_avg_age = async function (
  req,
  res
) {
  const vehicleType = req.params.vehicle_type;

  const cacheKey = `top_vehicle_types_in_fatal_crashes_with_avg_age_${vehicleType}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
    SELECT vehicle_type, fatal_crash_count, avg_driver_age
     FROM mv_vehicle_type_fatal_driver_stats 
     WHERE vehicle_type = '${vehicleType}'
     ORDER BY fatal_crash_count DESC;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /driver_age_groups_and_safety_equipment_effectiveness
//This query shows how effective different safety equipment types are for drivers across age groups by comparing fatality counts. It helps
//uncover whether certain age groups benefit less from protective measures.

const driver_age_groups_and_safety_equipment_effectiveness = async function (
  req,
  res
) {
  const safetyEquipment = req.params.safety_equipment;

  const cacheKey = `driver_age_groups_and_safety_equipment_effectiveness_${safetyEquipment}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      WITH drivers AS (
          SELECT p.*, se.name AS safety_equipment, ic.name AS injury_level
          FROM person p
          JOIN person_type pt ON p.person_type_id = pt.id
          JOIN safety_equipment se ON p.safety_equipment_id = se.id
          JOIN injury_classification ic ON p.injury_classification_id = ic.id
          WHERE pt.name = 'DRIVER' AND se.name = '${safetyEquipment}'
      )
      SELECT
          CASE
              WHEN age < 25 THEN 'Under 25'
              WHEN age BETWEEN 25 AND 64 THEN '25-64'
              ELSE '65+' END AS age_group,
          COUNT(*) AS driver_count,
          SUM(CASE WHEN injury_level = 'FATAL' THEN 1 ELSE 0 END) AS fatalities
      FROM drivers
      GROUP BY age_group
      ORDER BY fatalities DESC;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /safety_equipment_vs_injury_outcomes
//This query groups drivers by the type of safety equipment (e.g. seat belt, helmet) they were using and counts how many sustained fatal
//injuries. It joins person to person_type to filter only drivers, and to safety_equipment and injury_classification for equipment and injury
//status, as well as crash for context. Note: this query takes some time to run, we will add some indexes to improve its performance.

const safety_equipment_vs_injury_outcomes = async function (req, res) {
  const safetyEquipment = req.params.safety_equipment;

  const cacheKey = `safety_equipment_vs_injury_outcomes_${safetyEquipment}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT * FROM mv_safety_equipment_driver_stats
      WHERE safety_equipment = '${safetyEquipment}';
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /crashes_by_travel_direction
//Groups vehicles by their travel direction at the time of crash (e.g. N, S). It counts the number of vehicles and sums fatalities for each
//direction category.

const crashes_by_travel_direction = async function (req, res) {
  const year = req.params.year;

  const cacheKey = `crashes_by_travel_direction_${year}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
    SELECT travel_direction, vehicle_count, total_fatalities
     FROM mv_travel_direction_stats 
     WHERE crash_year = '${year}'
     ORDER BY vehicle_count DESC;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /crashes_per_vehicle_type
//Measures how often each vehicle type (passenger, van/mini-van, bus, etc.) is involved in fatal crashes. It counts vehicles by type and
//sums the fatalities in their crashes, computing the fatality rate per vehicle.

const crashes_per_vehicle_type = async function (req, res) {
  const vehicleType = req.params.vehicle_type;

  const cacheKey = `crashes_per_vehicle_type_${vehicleType}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT * FROM mv_vehicle_fatality_stats 
      WHERE v = '${vehicleType}'
      ORDER BY fatal_rate_pct DESC;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /average_age_of_vehicle
//Groups fatalities, vehicle count, and fatality rate by vehicle age

const average_age_of_vehicle = async function (req, res) {
  const vehicleType = req.params.vehicle_type;

  const cacheKey = `average_age_of_vehicle_${vehicleType}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
     SELECT vehicle_age, vehicle_count, total_fatalities, fatal_rate_pct
     FROM mv_vehicle_age_stats 
     WHERE vehicle_type = '${vehicleType}'
     ORDER BY total_fatalities DESC;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /total_crashes_and_fatalities
//Calculates the total crashes and fatalities for each crash type, then computes the percentage of crashes that were fatal. This highlights
//which types of crashes (e.g. head on, rear end, overturned) are the deadliest.

const total_crashes_and_fatalities = async function (req, res) {
  const year = req.params.year;

  const cacheKey = `total_crashes_and_fatalities_${year}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
     SELECT crash_type, total_crashes, total_fatalities, fatality_rate_pct
     FROM mv_crash_type_fatality_stats 
     WHERE crash_year = '${year}'
     ORDER BY fatality_rate_pct DESC
     LIMIT 5;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /top_primary_contributory_causes
//Identifies the top primary contributory causes of crashes that resulted in at least one fatality. By filtering on injuries_fatal > 0,
//it counts how many fatal crashes were attributed to each primary cause (like exceeding authorized speed limit, physical condition of driver, etc).

const top_primary_contributory_causes = async function (req, res) {
  const year = req.params.year;

  const cacheKey = `top_primary_contributory_causes_${year}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT primary_cause, fatal_crashes
      FROM mv_primary_cause_fatal_stats 
      WHERE crash_year = '${year}'
      ORDER BY fatal_crashes DESC
      LIMIT 5;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /weather_conditions
//Joins crashes to the weather condition at the time of each crash, counting crashes (and summing fatal injuries) per weather category.
//This reveals which weather (rain, snow, fog/smoke/haze, etc) produces the most crashes and fatalities.

const weather_conditions = async function (req, res) {
  const year = req.params.year;

  const cacheKey = `weather_conditions_${year}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT weather_condition, total_crashes, fatal_crashes
      FROM mv_weather_condition_stats 
      WHERE crash_year = '${year}'
      ORDER BY total_crashes DESC
      LIMIT 5;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /crash_record_id/:crash_record_id
//Gets crash data for a specific crash_record_id. This will be used for the CrashInfoPage

const crash_record_id = async function (req, res) {
  const crashRecordId = req.params.crash_record_id;

  const cacheKey = `crash_record_id_${crashRecordId}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT c.crash_record_id,
        c.crash_date,
        c.posted_speed_limit,
        c.street_no,
        c.street_name,
        c.street_direction,
        c.injuries_total,
        c.injuries_fatal,
        c.injuries_incapacitating,
        c.injuries_unknown,
        tcd.name AS traffic_control_device,
        wc.name AS weather_condition,
        lc.name AS lighting_condition,
        rsc.name AS roadway_surface_condition,
        rd.name AS road_defect,
        ct.name AS crash_type,
        d.name AS damage,
        pcc.name AS prim_contributory_cause,
        scc.name AS sec_contributory_cause,
        it.name AS injury_type,
        fct.name as first_crash_type,
        c.latitude,
        c.longitude
      FROM crash c
          JOIN public.traffic_control_device tcd on tcd.id = c.traffic_control_device_id
          JOIN public.weather_condition wc on c.weather_condition_id = wc.id
          JOIN public.lighting_condition lc on c.lighting_condition_id = lc.id
          JOIN public.roadway_surface_condition rsc on c.roadway_surface_cond_id = rsc.id
          JOIN public.road_defect rd on rd.id = c.road_defect_id
          JOIN public.crash_type ct on ct.id = c.crash_type_id
          JOIN public.damage d on d.id = c.damage_id
          JOIN public.prim_contributory_cause pcc on pcc.id = c.prim_contributory_cause_id
          JOIN public.sec_contributory_cause scc on scc.id = c.sec_contributory_cause_id
          JOIN public.injury_type it on it.id = c.most_severe_injury_id
          JOIN public.first_crash_type fct on fct.id = c.first_crash_type_id
      WHERE crash_record_id = '${crashRecordId}'
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows[0]);
      }
    }
  );
};

// Route: GET /search_crashes
// gets crash info based on user input. Will be used on crash search page
const search_crashes = async function (req, res) {
  const crashRecordID = req.query.crash_id ?? "";
  const speedLimitLow = req.query.speed_limit_low ?? 0;
  const speedLimitHigh = req.query.speed_limit_high ?? 25;
  const numInjuriesLow = req.query.injuries_low ?? 5;
  const numInjuriesHigh = req.query.injuries_high ?? 21;
  const crashHourLow = req.query.crash_hour_low ?? 0;
  const crashHourHigh = req.query.creash_hour_high ?? 12;
  const weatherCondition = req.query.weather_condition ?? "";
  const lightingCondition = req.query.lighting_condition ?? "";
  const firstCrashType = req.query.first_crash_type ?? "";
  const roadwayType = req.query.roadway_type ?? "";
  const surfaceCondition = req.query.surface_condition ?? "";
  const damageValue = req.query.damage_value ?? "";

  const page = req.query.page ?? 1;
  const pageSize = req.query.page_size ?? 10;
  const pageOffset = (page - 1) * pageSize;

  connection.query(
    `
        WITH weather AS(
            SELECT *
            FROM weather_condition
            WHERE name LIKE '%${weatherCondition}%'),
        light AS(
            SELECT *
            FROM lighting_condition
            WHERE name LIKE '%${lightingCondition}%'),
        type_of_crash AS (
            SELECT *
            FROM first_crash_type
            WHERE name LIKE '%${firstCrashType}%'),
        road_type AS (
            SELECT *
            FROM trafficway_type
            WHERE name LIKE '%${roadwayType}%'),
        surface AS (
            SELECT *
            FROM roadway_surface_condition
            WHERE name LIKE '%${surfaceCondition}%'),
        damage_value AS (
            SELECT *
            FROM damage
            WHERE name LIKE '%${damageValue}%')

        SELECT posted_speed_limit, injuries_total, crash_hour, weather.name AS weather_condition, light.name AS lighting_condition, tc.name AS first_crash_type, rt.name AS roadway_type, surface.name AS surface_condition, dv.name AS damage_value, crash_month, c.crash_record_id AS crash_id
        FROM crash c
            JOIN weather ON c.weather_condition_id = weather.id
            JOIN light ON c.lighting_condition_id = light.id
            JOIN type_of_crash tc ON c.crash_type_id = tc.id
            JOIN road_type rt ON c.trafficway_type_id = rt.id
            JOIN surface ON c.roadway_surface_cond_id = surface.id
            JOIN damage_value dv ON c.damage_id = dv.id
        WHERE crash_record_id LIKE '%${crashRecordID}%' AND
        ${speedLimitLow} <= posted_speed_limit AND posted_speed_limit  <= ${speedLimitHigh} AND
        ${numInjuriesLow} <= injuries_total AND injuries_total <= ${numInjuriesHigh} AND
        ${crashHourLow} <= crash_hour AND crash_hour <= ${crashHourHigh}`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /years
//Gets distinct years for the dropdown on Homepage.js

const years = async function (req, res) {
  const cacheKey = `years`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT DISTINCT c.crash_year
      FROM public.crash c
      ORDER BY c.crash_year DESC;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /vehicle_types
//Gets vehicle types for the dropdown on Homepage.js

const vehicle_types = async function (req, res) {
  const cacheKey = `vehicle_types`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT vt.name
      FROM public.vehicle_type vt
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /safety_equipment
//Gets safety_equipment for the dropdown on Homepage.js

const safety_equipment = async function (req, res) {
  const cacheKey = `safety_equipment`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT se.name
      FROM public.safety_equipment se
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /vehicle/:crash_reecord_id
//Gets info for all vehicles involved in a crash

const vehicles_in_crash = async function (req, res) {
  const crashRecordId = req.params.crash_record_id;
  const cacheKey = `vehicles_in_crash_${crashRecordId}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  connection.query(
    `
      SELECT unit_no, vehicle_year, occupant_cnt, vt.name as vehicle_type, m.name as make, ut.name as unit_type, s.name as license_plate_state, vu.name as vehicle_use, td.name as travel_direction, ma.name as maneuver, fcp.name as first_contact_point
      FROM vehicle v JOIN vehicle_type vt ON vt.id = v.vehicle_type_id
      JOIN make m ON m.id = v.make_id
      JOIN unit_type ut ON v.unit_type_id  = ut.id
      JOIN state s ON s.id = v.lic_plate_state_id
      JOIN vehicle_defect vd ON vd.id = v.vehicle_defect_id
      JOIN vehicle_use vu ON vu.id = v.vehicle_use_id
      JOIN travel_direction td ON td.id = v.travel_direction_id
      JOIN maneuver ma ON ma.id = v.maneuver_id
      JOIn first_contact_point fcp ON v.first_contact_point_id = fcp.id
      WHERE v.crash_record_id = '${crashRecordId}'
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        setCache(cacheKey, data.rows);
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /types_of_weather_conditions
//Gets distinct weather conditions for the dropdown on search page

const types_of_weather_conditions = async function (req, res) {
  connection.query(
    `
      SELECT DISTINCT *
      FROM weather_condition
      ORDER BY name;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /types_of_lighting_conditions
//Gets distinct lighting conditions for the dropdown on search page

const types_of_lighting_conditions = async function (req, res) {
  connection.query(
    `
      SELECT DISTINCT *
      FROM lighting_condition
      ORDER BY name;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /types_of_first_crash_types
//Gets distinct irst crash types for the dropdown on search page

const types_of_first_crash_types = async function (req, res) {
  connection.query(
    `
      SELECT DISTINCT *
      FROM first_crash_type
      ORDER BY name;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /types_of_roadway
//Gets distinct types of roadways for the dropdown on search page

const types_of_roadway = async function (req, res) {
  connection.query(
    `
      SELECT DISTINCT *
      FROM trafficway_type
      ORDER BY name;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /types_of_surface_conditions
//Gets distinct surface conditions values for the dropdown on search page

const types_of_surface_conditions = async function (req, res) {
  connection.query(
    `
      SELECT DISTINCT *
      FROM roadway_surface_condition
      ORDER BY name;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

//Route: GET /types_of_damage_value
//Gets distinct damage values for the dropdown on search page

const types_of_damage_value = async function (req, res) {
  connection.query(
    `
      SELECT DISTINCT *
      FROM damage;
      `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

module.exports = {
  crash_severity_index_per_city,
  top_vehicle_types_in_fatal_crashes_with_avg_age,
  driver_age_groups_and_safety_equipment_effectiveness,
  safety_equipment_vs_injury_outcomes,
  crashes_by_travel_direction,
  crashes_per_vehicle_type,
  average_age_of_vehicle,
  total_crashes_and_fatalities,
  top_primary_contributory_causes,
  weather_conditions,
  crash_record_id,
  search_crashes,
  years,
  vehicle_types,
  safety_equipment,
  vehicles_in_crash,
  types_of_weather_conditions,
  types_of_lighting_conditions,
  types_of_first_crash_types,
  types_of_roadway,
  types_of_surface_conditions,
  types_of_damage_value,
};
