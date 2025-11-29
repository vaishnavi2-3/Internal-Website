const PersonalDetails = require("../models/personalDetails");

const getBirthdaysThisWeek = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const allEmployees = await PersonalDetails.find({
      dateOfBirth: { $exists: true }
    });

    const upcomingBirthdays = [];

    allEmployees.forEach(emp => {
      if (!emp.dateOfBirth) return;

      // 🔥 SAFE PARSING — always gets YYYY-MM-DD
      const dobString = emp.dateOfBirth.toString().slice(0, 10);
      const [year, month, day] = dobString.split("-");

      // Create DOB for THIS year
      let birthdayThisYear = new Date(
        today.getFullYear(),
        Number(month) - 1,
        Number(day)
      );

      // If already passed → move to next year
      if (birthdayThisYear < today) {
        birthdayThisYear = new Date(
          today.getFullYear() + 1,
          Number(month) - 1,
          Number(day)
        );
      }

      // Check range
      if (birthdayThisYear >= today && birthdayThisYear <= nextWeek) {
        upcomingBirthdays.push({
          name: `${emp.firstName} ${emp.lastName}`,
          officialEmail: emp.officialEmail || "",
          dateOfBirth: dobString,
          birthdayThisYear
        });
      }
    });

    upcomingBirthdays.sort((a, b) => a.birthdayThisYear - b.birthdayThisYear);

    return res.status(200).json({
      msg: "Upcoming birthdays in next 7 days",
      count: upcomingBirthdays.length,
      birthdays: upcomingBirthdays
    });

  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

module.exports = { getBirthdaysThisWeek };
