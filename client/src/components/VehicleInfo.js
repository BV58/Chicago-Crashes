export default function VehicleInfo({ vehicle }) {
  return (
    <div>
      <div>
        <strong>Vehicle {vehicle.unit_no}</strong>
      </div>
      <div>
        <strong>Year:</strong> {vehicle.vehicle_year}
      </div>
      <div>
        <strong>Make:</strong> {vehicle.make}
      </div>
      <div>
        <strong>Plate State:</strong> {vehicle.license_plate_state}
      </div>
      <div>
        <strong>Type:</strong> {vehicle.vehicle_type}
      </div>
      <div>
        <strong>Unit Type:</strong> {vehicle.unit_type}
      </div>
      <div>
        <strong>Occupants:</strong> {vehicle.occupant_cnt}
      </div>
      <div>
        <strong>Travel Direction:</strong> {vehicle.travel_direction}
      </div>
      <div>
        <strong>Maneuver:</strong> {vehicle.maneuver}
      </div>
      <div>
        <strong>First Contact Point:</strong> {vehicle.first_contact_point}
      </div>
    </div>
  );
}
