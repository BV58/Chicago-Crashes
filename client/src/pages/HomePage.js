import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Box, Container } from '@mui/material';

const config = require('../config.json');

export default function HomePage() {
  const[years, setYears] = useState([]);
  const[vehicleTypes, setVehicleTypes] = useState([]);
  const[safetyEquipment, setSafetyEquipment] = useState([]);
  const[selectedYear, setSelectedYear] = useState(2025);
  const[selectedVehicleType, setSelectedVehicleType] = useState('PASSENGER');
  const[selectedSafetyEquipment, setSelectedSafetyEquipment] = useState('DOT COMPLIANT MOTORCYCLE HELMET');
  const[severityData, setSeverityData] = useState([]);
  const[travelDirection, setTravelDirection] = useState([]);
  const[totalCrashesFatalities, setTotalCrashesFatalities] = useState([]);
  const[primaryContributoryCauses, setPrimaryContributoryCauses] = useState([]);
  const[weatherConditions, setWeatherConditions] = useState([])
  const[ageGroupSafetyEquipment, setAgeGroupSafetyEquipment] = useState([])
  const[safetyEqipmentInjuryOutcomes, setSafetyEqipmentInjuryOutcomes] = useState([])
  const[vehicleTypeFatalCrashesAvgAge, setVehicleTypeFatalCrashesAvgAge] = useState([])
  const[crashesPerVehicleType, setCrashesPerVehicleType] = useState([])
  const[avgAgeOfVehicle, setAvgAgeOfVehicle] = useState([])

  useEffect(() => {
  const base = `http://${config.server_host}:${config.server_port}`;

  Promise.all([
    fetch(`${base}/years`).then(res => res.json()),
    fetch(`${base}/vehicle_types`).then(res => res.json()),
    fetch(`${base}/safety_equipment`).then(res => res.json()),
    fetch(`${base}/crash_severity_index_per_city/${selectedYear}`).then(res => res.json()),
    fetch(`${base}/crashes_by_travel_direction/${selectedYear}`).then(res => res.json()),
    fetch(`${base}/total_crashes_and_fatalities/${selectedYear}`).then(res => res.json()),
    fetch(`${base}/top_primary_contributory_causes/${selectedYear}`).then(res => res.json()),
    fetch(`${base}/weather_conditions/${selectedYear}`).then(res => res.json()),
    fetch(`${base}/driver_age_groups_and_safety_equipment_effectiveness/${encodeURIComponent(selectedSafetyEquipment)}`).then(res => res.json()),
    fetch(`${base}/safety_equipment_vs_injury_outcomes/${encodeURIComponent(selectedSafetyEquipment)}`).then(res => res.json()),
    fetch(`${base}/top_vehicle_types_in_fatal_crashes_with_avg_age/${encodeURIComponent(selectedVehicleType)}`).then(res => res.json()),
    fetch(`${base}/crashes_per_vehicle_type/${encodeURIComponent(selectedVehicleType)}`).then(res => res.json()),
    fetch(`${base}/average_age_of_vehicle/${encodeURIComponent(selectedVehicleType)}`).then(res => res.json()),
  ]).then(([
    yearsRes,
    vehicleTypesRes,
    safetyEquipmentRes,
    severityDataRes,
    travelDirectionRes,
    totalCrashesFatalitiesRes,
    primaryContributoryCausesRes,
    weatherConditionsRes,
    ageGroupSafetyEquipmentRes,
    safetyEqipmentInjuryOutcomesRes,
    vehicleTypeFatalCrashesAvgAgeRes,
    crashesPerVehicleTypeRes,
    avgAgeOfVehicleRes
  ]) => {
    setYears(yearsRes.slice(0,-2).map(item => Number(item.crash_year)));
    setVehicleTypes(vehicleTypesRes.map(item => item.name));
    setSafetyEquipment(safetyEquipmentRes.map(item => item.name));
    setSeverityData(severityDataRes);
    setTravelDirection(travelDirectionRes);
    setTotalCrashesFatalities(totalCrashesFatalitiesRes);
    setPrimaryContributoryCauses(primaryContributoryCausesRes);
    setWeatherConditions(weatherConditionsRes);
    setAgeGroupSafetyEquipment(ageGroupSafetyEquipmentRes);
    setSafetyEqipmentInjuryOutcomes(safetyEqipmentInjuryOutcomesRes);
    setVehicleTypeFatalCrashesAvgAge(vehicleTypeFatalCrashesAvgAgeRes);
    setCrashesPerVehicleType(crashesPerVehicleTypeRes);
    setAvgAgeOfVehicle(avgAgeOfVehicleRes);
  });
}, [selectedYear, selectedSafetyEquipment, selectedVehicleType]);

  const format = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' };
  const formatLeft = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'left' };

  return (
    <Container>
      <h1>Chicago Crash Safety Dashboard</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2>Annual Data</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ height: '30px', fontSize: '16px' }}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    
    <Container style={format}>
      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <ResponsiveContainer width={500} height={350}>
          <BarChart
            data={severityData}
            layout="vertical"
            margin={{ top: 40, left: 100 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={18}
              fontWeight={600}
            >
              Top 5 Cities
            </text>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="city_name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="severity_index" stroke="#b1ddf3" fill="#b1ddf3" name="Severity Index (Fatalities per Crash)"/>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <ResponsiveContainer width={500} height={350}>
          <BarChart
            data={travelDirection}
            layout="vertical"
            margin={{ top: 40, left: 100 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={18}
              fontWeight={600}
            >
              Travel Direction
            </text>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="travel_direction" interval={0} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_fatalities" stroke="#83c0d8" fill="#83c0d8" name="Fatalities"/>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <ResponsiveContainer width={500} height={350}>
          <BarChart
            data={totalCrashesFatalities}
            layout="vertical"
            margin={{ top: 40, left: 100 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={18}
              fontWeight={600}
            >
              Top 5 Crash Types
            </text>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="crash_type" />
            <Tooltip />
            <Legend />
            <Bar dataKey="fatality_rate_pct" stroke="#5ba4c8" fill="#5ba4c8" name="Percent Fatalities"/>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <ResponsiveContainer width={500} height={350}>
          <BarChart
            data={weatherConditions}
            layout="vertical"
            margin={{ top: 40, left: 100 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={18}
              fontWeight={600}
            >
              Top 5 Weather Conditions
            </text>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="weather_condition" />
            <Tooltip />
            <Legend />
            <Bar dataKey="fatal_crashes" stroke="#408dba" fill="#408dba" name="Crashes with Fatalities"/>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        <ResponsiveContainer width={700} height={350}>
          <BarChart
            data={primaryContributoryCauses}
            layout="vertical"
            margin={{ top: 40, left: 150 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={18}
              fontWeight={600}
            >
              Top 5 Crash Primary Causes
            </text>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="primary_cause" tick={{ fontSize: 12 }} width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="fatal_crashes" stroke="#2c6d9b" fill="#2c6d9b" name="Crashes with Fatalities"/>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
    </Container>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <h2>Safety Equipment Data</h2>
      <select
        value={selectedSafetyEquipment}
        onChange={(e) => setSelectedSafetyEquipment(e.target.value)}
        style={{ height: '30px', fontSize: '16px' }}
      >
        {safetyEquipment.map((equipment) => (
          <option key={equipment} value={equipment}>{equipment}</option>
        ))}
      </select>
    </div>

    <Container style={formatLeft}>
      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
        }}
      >
        <h3>Number of Drivers: {safetyEqipmentInjuryOutcomes[0]?.total_drivers ?? 0}</h3>
        <h3>Number of Fatalities: {safetyEqipmentInjuryOutcomes[0]?.fatal_drivers ?? 0}</h3>
        <h3>Fatality Rate: {(
          ((safetyEqipmentInjuryOutcomes[0]?.fatal_drivers ?? 0) / (safetyEqipmentInjuryOutcomes[0]?.total_drivers ?? 1)) * 100
        ).toFixed(2)}%</h3>
      </Box>
      
      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        {ageGroupSafetyEquipment.length > 1 ? (
          <ResponsiveContainer width={500} height={350}>
            <BarChart
              data={ageGroupSafetyEquipment}
              layout="vertical"
              margin={{ top: 40, left: 100 }}
            >
              <text
                x="50%"
                y={20}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={18}
                fontWeight={600}
              >
                Age Groups
              </text>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="age_group" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="fatalities"
                stroke="#a8b1c2"
                fill="#a8b1c2"
                name="Fatalities"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ width: 500, height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 18, fontWeight: 600 }}>
            Not enough data to display the chart
          </div>
        )}
      </Box>
    </Container>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <h2>Vehicle Type Data</h2>
      <select
        value={selectedVehicleType}
        onChange={(e) => setSelectedVehicleType(e.target.value)}
        style={{ height: '30px', fontSize: '16px' }}
      >
        {vehicleTypes.map((vehicle) => (
          <option key={vehicle} value={vehicle}>{vehicle}</option>
        ))}
      </select>
    </div>
    <Container style={formatLeft}>
      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          
        }}
      >
        <h3>Number of Vehicles: {crashesPerVehicleType[0]?.vehicle_count ?? 0}</h3>
        <h3>Number of Fatalities: {crashesPerVehicleType[0]?.total_fatalities ?? 0}</h3>
        <h3>Fatality Rate: {crashesPerVehicleType[0]?.fatal_rate_pct ?? 0}%</h3>
        <h3>Average Driver Age: {vehicleTypeFatalCrashesAvgAge[0]?.avg_driver_age ?? 0}</h3>
      </Box>
      
      <Box
        sx={{
          p: 2,
          m: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper',
        }}
      >
        {avgAgeOfVehicle.length > 1 ? (
          <ResponsiveContainer width={500} height={350}>
            <BarChart
              data={avgAgeOfVehicle}
              layout="vertical"
              margin={{ top: 40, left: 100 }}
            >
              <text
                x="50%"
                y={20}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={18}
                fontWeight={600}
              >
                Vehicle Age Groups
              </text>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="vehicle_age" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total_fatalities"
                stroke="#ff0000"
                fill="#ff0000"
                name="Fatalities"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ width: 500, height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 18, fontWeight: 600 }}>
            Not enough data to display the chart
          </div>
        )}
      </Box>
    </Container>

    </Container>
  );
};

