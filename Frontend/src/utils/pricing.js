import {
  HOURLY_DISCOUNT_6H_PERCENT,
  HOURLY_DISCOUNT_10H_PERCENT,
  HOURLY_DISCOUNT_THRESHOLD_6,
  HOURLY_DISCOUNT_THRESHOLD_10,
  WELCOME_DISCOUNT_PERCENT,
  LONG_TRIP_DAYS,
  LONG_TRIP_DISCOUNT_PERCENT,
} from "../config/app.js";

export function getTripHours(pickupDate, pickupTime, returnDate, returnTime) {
  const pickup = new Date(`${pickupDate}T${pickupTime || "00:00"}`);
  const return_ = new Date(`${returnDate}T${returnTime || "00:00"}`);
  return Math.max(1, Math.ceil((return_ - pickup) / (1000 * 60 * 60)));
}

export function getTripDays(pickupDate, pickupTime, returnDate, returnTime) {
  const pickup = new Date(`${pickupDate}T${pickupTime || "00:00"}`);
  const return_ = new Date(`${returnDate}T${returnTime || "00:00"}`);
  return Math.max(1, Math.ceil((return_ - pickup) / (1000 * 60 * 60 * 24)));
}

/** 5% off hourly rate after 6h; 10% off after 10h */
export function getHourlyDiscountPercent(hours) {
  if (hours > HOURLY_DISCOUNT_THRESHOLD_10) return HOURLY_DISCOUNT_10H_PERCENT;
  if (hours > HOURLY_DISCOUNT_THRESHOLD_6) return HOURLY_DISCOUNT_6H_PERCENT;
  return 0;
}

export function calculateVehiclePrice(vehicle, bookingContext = {}) {
  const {
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    duration: durationDays,
  } = bookingContext;

  const hours =
    pickupDate && returnDate
      ? getTripHours(pickupDate, pickupTime, returnDate, returnTime)
      : null;
  const days =
    durationDays ||
    (pickupDate && returnDate
      ? getTripDays(pickupDate, pickupTime, returnDate, returnTime)
      : 1);

  const pricePerHour = Number(vehicle.pricePerHour) || 0;
  const pricePerDay = Number(vehicle.price) || 0;

  let baseTotal = 0;
  let hourlyDiscountPercent = 0;
  let effectiveHourlyRate = pricePerHour;
  let pricingMode = "daily";

  if (pricePerHour > 0 && hours) {
    pricingMode = "hourly";
    hourlyDiscountPercent = getHourlyDiscountPercent(hours);
    effectiveHourlyRate = Math.round(pricePerHour * (1 - hourlyDiscountPercent / 100));
    baseTotal = hours * effectiveHourlyRate;
  } else {
    baseTotal = days * pricePerDay;
  }

  const isLongTrip = days >= LONG_TRIP_DAYS;
  const promoDiscountPercent = isLongTrip
    ? LONG_TRIP_DISCOUNT_PERCENT
    : WELCOME_DISCOUNT_PERCENT;
  const promoDiscountAmount = Math.round(baseTotal * (promoDiscountPercent / 100));
  const total = Math.max(0, baseTotal - promoDiscountAmount);

  return {
    hours,
    days,
    pricingMode,
    pricePerHour,
    pricePerDay,
    hourlyDiscountPercent,
    effectiveHourlyRate,
    baseTotal,
    promoDiscountPercent,
    promoDiscountAmount,
    total,
    totalSavings: promoDiscountAmount + (pricingMode === "hourly" && hourlyDiscountPercent
      ? hours * pricePerHour - hours * effectiveHourlyRate
      : 0),
  };
}
