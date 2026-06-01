import React, { useState, useEffect } from "react";
import './calendar.css';
import useAdminBookingStore from "../../../../store/adminBookingStore";

// Function to format date into YYYY-MM-DD format
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if month is single digit
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if day is single digit
  return `${year}-${month}-${day}`; // Return formatted date in YYYY-MM-DD
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Fetch bookings function from store
  const fetchBookingsByDate = useAdminBookingStore((state) => state.fetchBookingsByDate);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);

    // Format the date into YYYY-MM-DD
    const formattedDate = formatDate(newSelectedDate);

    console.log('Selected Date (Formatted):', formattedDate);

    // Fetch bookings for the selected date
    fetchBookingsByDate(formattedDate);
  };

  const renderDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Empty slots for the previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate.getDate() &&
                         currentDate.getMonth() === selectedDate.getMonth() &&
                         currentDate.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
          onClick={() => handleSelectDate(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  // Effect to fetch bookings for the current date on initial load
  useEffect(() => {
    const formattedDate = formatDate(new Date()); // Get today's date in YYYY-MM-DD
    fetchBookingsByDate(formattedDate);
  }, []);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <span>
          {currentDate.toLocaleString('default', { month: 'long' })}{' '}
          {currentDate.getFullYear()}
        </span>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar-days-header">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="calendar-day-header">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">{renderDays()}</div>
    </div>
  );
};

export default Calendar;


















// import React, { useState } from 'react';
// import './calendar.css';

// import useAdminBookingStore from "../../../../store/adminBookingStore"; // Adjust if path differs


// const Calendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const handlePrevMonth = () => {
//     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
//   };

//   const formatDate = (date) => {
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   };
  
//   const handleSelectDate = (day) => {
//     const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//     setSelectedDate(newSelectedDate);
  
//     // Manually format the selected date
//     const formattedDate = formatDate(newSelectedDate);
  
//     console.log('Selected Date (Formatted):', formattedDate); // This will show DD-MM-YYYY
  
//     // Call the store to fetch bookings for the selected date
//     fetchBookingsByDate(formattedDate);
//   };

//   // to check the date format
//   // const handleSelectDate = (day) => {
//   //   const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
//   //   setSelectedDate(newSelectedDate);
    
//   //   console.log('Selected Date (Raw):', newSelectedDate);
//   //   console.log('Selected Date (toLocaleDateString):', newSelectedDate.toLocaleDateString());
//   //   console.log('Selected Date (toISOString):', newSelectedDate.toISOString());
//   // };
  

//   // const handleSelectDate = (day) => {
//   //   setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
//   // };

//   const renderDays = () => {
//     const days = [];
//     const daysInMonth = getDaysInMonth(currentDate);
//     const firstDay = getFirstDayOfMonth(currentDate);

//     // Empty slots for the previous month
//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
//     }

//     // Days of the current month
//     for (let day = 1; day <= daysInMonth; day++) {
//       const isSelected = day === selectedDate.getDate() &&
//                          currentDate.getMonth() === selectedDate.getMonth() &&
//                          currentDate.getFullYear() === selectedDate.getFullYear();

//       days.push(
//         <div
//           key={day}
//           className={`calendar-day ${isSelected ? 'selected' : ''}`}
//           onClick={() => handleSelectDate(day)}
//         >
//           {day}
//         </div>
//       );
//     }

//     return days;
//   };

//   return (
//     <div className="calendar">
//       <div className="calendar-header">
//         <button onClick={handlePrevMonth}>&lt;</button>
//         <span>
//           {currentDate.toLocaleString('default', { month: 'long' })}{' '}
//           {currentDate.getFullYear()}
//         </span>
//         <button onClick={handleNextMonth}>&gt;</button>
//       </div>
//       <div className="calendar-days-header">
//   {daysOfWeek.map((day, index) => (
//     <div key={index} className="calendar-day-header">
//       {day}
//     </div>
//   ))}
// </div>

//       <div className="calendar-days">{renderDays()}</div>
//     </div>
//   );
// };

// export default Calendar;
