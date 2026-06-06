import { DEFAULT_CITY } from "../data/indianCities";

export function getDefaultSearchForm() {
  const now = new Date();
  const pickup = new Date(now);
  const returnDate = new Date(now);
  pickup.setDate(now.getDate() + 1);
  returnDate.setDate(now.getDate() + 2);

  return {
    city: DEFAULT_CITY,
    pickupDate: pickup.toISOString().split("T")[0],
    pickupTime: "10:00",
    returnDate: returnDate.toISOString().split("T")[0],
    returnTime: "10:00",
    withDriver: false,
    ownDriving: true,
  };
}
