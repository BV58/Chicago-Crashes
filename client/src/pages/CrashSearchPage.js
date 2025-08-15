import { useEffect, useState } from "react";
import config from "../config";
import { Button, Container, Grid, Slider, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

export default function CrashSearchPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);

  const [crash_id, set_crash_id] = useState("");
  const [posted_speed_limit, set_posted_speed_limit] = useState([0, 25]);
  const [injuries_total, set_injuries_total] = useState([5, 21]);
  const [crash_hour, set_crash_hour] = useState([0, 12]);
  const [weather_conditions, set_weather_conditions] = useState([]);
  const [selected_weather_condition, set_selected_weather_condition] = useState('');
  const [lighting_condition, set_lighting_condition] = useState([]);
  const [selected_lighting_condition, set_selected_lighting_condition] = useState('');
  const [first_crash_type, set_first_crash_type] = useState([]);
  const [selected_first_crash_type, set_selected_first_crash_type] = useState('');
  const [roadway_type, set_roadway_type] = useState([]);
  const [selected_roadway_type, set_selected_roadway_type] = useState('');
  const [surface_condition, set_surface_condition] = useState([]);
  const [selected_surface_condition, set_selected_surface_condition] = useState('');
  const [damage_value, set_damage_value] = useState([]);
  const [selected_damage_value, set_selected_damage_value] = useState('');
  const [table_loading, set_table_loading] = useState(false);

  const boxStyle = {width: '300px', borderRadius : '8px', height: '40px', fontSize: '16px', padding: '8px'};

  // initially populate the table with all data from crash relation
useEffect(() => {

const base = `http://${config.server_host}:${config.server_port}`;

Promise.all([
fetch(`${base}/search_crashes`).then(res => res.json()),
fetch(`${base}/types_of_weather_conditions`).then(res => res.json()),
fetch(`${base}/types_of_lighting_conditions`).then(res => res.json()),
fetch(`${base}/types_of_first_crash_types`).then(res => res.json()),
fetch(`${base}/types_of_roadway`).then(res => res.json()),
fetch(`${base}/types_of_surface_conditions`).then(res => res.json()),
fetch(`${base}/types_of_damage_value`).then(res => res.json()),
]).then(([
search_crash_response,
type_of_weather_conditions_response,
types_of_lighting_conditions_response,
types_of_first_crash_types_response,
types_of_roadway_response,
types_of_surface_conditions_response,
types_of_damage_value_response
]) => {
const crashWithId = search_crash_response.map((crash_row) => ({
          id: crash_row.crash_id,
          ...crash_row,
        }));
setData(crashWithId);
set_weather_conditions(type_of_weather_conditions_response.map(item => item.name));
set_lighting_condition(types_of_lighting_conditions_response.map(item => item.name));
set_first_crash_type(types_of_first_crash_types_response.map(item => item.name));
set_roadway_type(types_of_roadway_response.map(item => item.name));
set_surface_condition(types_of_surface_conditions_response.map(item => item.name));
set_damage_value(types_of_damage_value_response.map(item => item.name));

});
}, []);


  // update table when user presses search button
  const search = () => {
    set_table_loading(true);

    fetch(
      `http://${config.server_host}:${config.server_port}/search_crashes?crash_id=${crash_id}` +
        `&speed_limit_low=${posted_speed_limit[0]}&speed_limit_high=${posted_speed_limit[1]}` +
        `&injuries_low=${injuries_total[0]}&injuries_high=${injuries_total[1]}` +
        `&crash_hour_low=${crash_hour[0]}&crash_hour_high=${crash_hour[1]}` +
        `&weather_condition=${selected_weather_condition}` +
        `&lighting_condition=${selected_lighting_condition}` +
        `&first_crash_type=${selected_first_crash_type}` +
        `&roadway_type=${selected_roadway_type}` +
        `&surface_condition=${selected_surface_condition}` +
        `&damage_value=${selected_damage_value}`
    )
      .then((res) => res.json())
      .then((resJson) => {
        const crashWithId = resJson.map((crash_row) => ({
          id: crash_row.crash_id,
          ...crash_row,
        }));
        setData(crashWithId);
        set_table_loading(false);
      });
  };

    const columns = [
        {
            field: "crash_id",
            headerName: "Crash ID",
            width: 200,
            renderCell: (cell_style) => (
                <span style={{ color: '#41B6E6', cursor: 'pointer', textDecoration: 'underline' }}> {cell_style.value}</span>)
        },
    { field: "posted_speed_limit", headerName: "Posted Speed Limit", width: 150 },
    { field: "injuries_total", headerName: "Number of Injuries", width: 150 },
    { field: "crash_hour", headerName: "Hour Crash Occured", width: 150 },
    { field: "weather_condition", headerName: "Weather Condition", width: 180 },
    { field: "lighting_condition", headerName: "Lighting Condition", width: 220,},
    { field: "first_crash_type", headerName: "First Crash Type", width: 300 },
    { field: "roadway_type", headerName: "Type of Roadway", width: 280 },
    { field: "surface_condition", headerName: "Surface Conditions", width: 150,},
    { field: "damage_value", headerName: "Damage Cost", width: 150 },
    ];
  const navigate = useNavigate();
  const handleRowClick = (params) => {
    navigate(`/${params.row.crash_id}`);
    };

  return (

    <Container>
      <h2>Search Crashes</h2>
      <Grid container spacing={6}>
        <Grid item xs={9}>
          <TextField
            label="Search by Crash ID"
            value={crash_id}
            onChange={(e) => set_crash_id(e.target.value)}
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={4}>
          <p>Posted Speed Limit</p>
          <Slider
            value={posted_speed_limit}
            min={0}
            max={99}
            step={1}
            onChange={(e, newValue) => set_posted_speed_limit(newValue)}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={4}>
          <p>Total Number of Injuries</p>
          <Slider
            value={injuries_total}
            min={0}
            max={21}
            step={1}
            onChange={(e, newValue) => set_injuries_total(newValue)}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={4}>
          <p>Crash Hour</p>
          <Slider
            value={crash_hour}
            min={0}
            max={24}
            step={1}
            onChange={(e, newValue) => set_crash_hour(newValue)}
            valueLabelDisplay="auto"
          />
        </Grid>


        <Grid item xs={4}>
        <select
          value={selected_weather_condition}
          onChange={(e) => set_selected_weather_condition(e.target.value)}
          style={boxStyle}
        > 
          <option value='' disabled hidden>Weather Conditions</option>
          {weather_conditions.map(weather_condition => (
            <option key={weather_condition} value={weather_condition}>{weather_condition}</option>
          ))}
        </select>
        </Grid>

        <Grid item xs={4}>
        <select
          value={selected_lighting_condition}
          onChange={(e) => set_selected_lighting_condition(e.target.value)}
          style={boxStyle}
        > 
          <option value='' disabled hidden>Lighting Conditions</option>
          {lighting_condition.map(lighting_condition => (
            <option key={lighting_condition} value={lighting_condition}>{lighting_condition}</option>
          ))}
        </select>
        </Grid>

        <Grid item xs={4}>
        <select
          value={selected_first_crash_type}
          onChange={(e) => set_selected_first_crash_type(e.target.value)}
          style={boxStyle}
        > 
          <option value='' disabled hidden>First Crash Type</option>
          {first_crash_type.map(first_crash_type => (
            <option key={first_crash_type} value={first_crash_type}>{first_crash_type}</option>
          ))}
        </select>
        </Grid>

         
        <Grid item xs={4}>
        <select
          value={selected_roadway_type}
          onChange={(e) => set_selected_roadway_type(e.target.value)}
          style={boxStyle}
        > 
          <option value='' disabled hidden>Type of Roadway</option>
          {roadway_type.map(roadway_type => (
            <option key={roadway_type} value={roadway_type}>{roadway_type}</option>
          ))}
        </select>
        </Grid>

        <Grid item xs={4}>
        <select
          value={selected_surface_condition}
          onChange={(e) => set_selected_surface_condition(e.target.value)}
          style={boxStyle}
        > 
          <option value='' disabled hidden>Surface Condition</option>
          {surface_condition.map(surface_condition => (
            <option key={surface_condition} value={surface_condition}>{surface_condition}</option>
          ))}
        </select>
        </Grid>

        <Grid item xs={4}>
        <select
          value={selected_damage_value}
          onChange={(e) => set_selected_damage_value(e.target.value)}
          style={boxStyle}
        > 
          <option value='' disabled hidden>Cost of Damage Reported</option>
          {damage_value.map(damage_value => (
            <option key={damage_value} value={damage_value}>{damage_value}</option>
          ))}
        </select>
        </Grid>

      </Grid>
      <Button
        onClick={() => search()}
        style={{ left: "50%",
                 transform: "translateX(-50%)",
                 width: '150px',
                 backgroundColor: '#41B6E6',
                 color: 'white',
                 marginTop: '50px',
                 borderRadius : '8px',
                 height: '40px',
                 fontSize: '18px',
                 padding: '8px' }}
      >
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
        onRowClick={handleRowClick}
        loading={table_loading}
        slotProps={{loadingOverlay: 
            {variant: 'circular-progress',
             noRowsVariant: 'circular-progress',
            },
            }}
      />
    </Container>
  );
}
