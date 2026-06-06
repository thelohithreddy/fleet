const HOURLY_DISCOUNT_THRESHOLD_6 = 6;
const HOURLY_DISCOUNT_THRESHOLD_10 = 10;
const HOURLY_DISCOUNT_6H_PERCENT = 5;
const HOURLY_DISCOUNT_10H_PERCENT = 10;

function getTripHours(pickupDate, returnDate) {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    return Math.max(1, Math.ceil((returnD - pickup) / (1000 * 60 * 60)));
}

function getHourlyDiscountPercent(hours) {
    if (hours > HOURLY_DISCOUNT_THRESHOLD_10) return HOURLY_DISCOUNT_10H_PERCENT;
    if (hours > HOURLY_DISCOUNT_THRESHOLD_6) return HOURLY_DISCOUNT_6H_PERCENT;
    return 0;
}

function calculateBookingTotal(vehicle, pickupDate, returnDate) {
    const pricePerHour = Number(vehicle?.pricePerHour) || 0;
    const pricePerDay = Number(vehicle?.price) || 0;
    const hours = getTripHours(pickupDate, returnDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.max(1, Math.ceil((new Date(returnDate) - new Date(pickupDate)) / msPerDay));

    if (pricePerHour > 0) {
        const hourlyDiscount = getHourlyDiscountPercent(hours);
        const effectiveRate = pricePerHour * (1 - hourlyDiscount / 100);
        return {
            totalAmount: Math.round(hours * effectiveRate),
            duration: days,
            tripHours: hours,
            hourlyDiscountPercent: hourlyDiscount,
            pricingMode: 'hourly',
        };
    }

    return {
        totalAmount: Math.round(days * pricePerDay),
        duration: days,
        tripHours: hours,
        hourlyDiscountPercent: 0,
        pricingMode: 'daily',
    };
}

module.exports = {
    getTripHours,
    getHourlyDiscountPercent,
    calculateBookingTotal,
};
