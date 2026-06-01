// Function to calculate the number of days between two dates
const calculateNumberOfDays = (pickupDate, returnDate) => {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const timeDiff = returnD - pickup;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
};

// Function to calculate total payment
const calculateTotalPayment = (pricePerDay, pickupDate, returnDate) => {
    const numberOfDays = calculateNumberOfDays(pickupDate, returnDate);
    return pricePerDay * numberOfDays;
};

module.exports = { calculateNumberOfDays, calculateTotalPayment };