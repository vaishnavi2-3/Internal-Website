const PersonalDetails = require("../models/personalDetails");

const getBirthdaysThisWeek = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const allEmployees = await PersonalDetails.find({
      dateOfBirth: { $exists: true }
    });

    const upcomingBirthdays = [];

    allEmployees.forEach(emp => {
      if (!emp.dateOfBirth) return;

      const dob = new Date(emp.dateOfBirth);

      let birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

      if (birthdayThisYear < today) {
        birthdayThisYear = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
      }

      if (birthdayThisYear >= today && birthdayThisYear <= nextWeek) {
        upcomingBirthdays.push({
          name: emp.firstName + " " + emp.lastName,
          officialEmail: emp.officialEmail,
          dateOfBirth: emp.dateOfBirth,
          birthdayThisYear: birthdayThisYear,
        });
      }
    });

    upcomingBirthdays.sort((a, b) => a.birthdayThisYear - b.birthdayThisYear);

    res.status(200).json({
      msg: "Upcoming birthdays in next 7 days",
      count: upcomingBirthdays.length,
      birthdays: upcomingBirthdays
    });

  } catch (err) {
    console.error("Error fetching birthdays:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

module.exports = { getBirthdaysThisWeek };
