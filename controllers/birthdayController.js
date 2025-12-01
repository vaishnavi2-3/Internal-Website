const Employee = require("../models/Employee");
const PersonalDetails = require("../models/personalDetails");

const getBirthdaysThisWeek = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const employees = await Employee.find();
    const personalDetails = await PersonalDetails.find();

    const upcoming = [];

    for (const emp of employees) {
      const pd = personalDetails.find(p => p.officialEmail === emp.email);
      if (!pd || !pd.dob) continue;

      // Parse DOB
      let parts = pd.dob.includes("-") ? pd.dob.split("-") : pd.dob.split("/");

      let day, month, year;

      if (parts[0].length === 4) {
        // yyyy-mm-dd
        year = parts[0];
        month = parts[1] - 1;
        day = parts[2];
      } else {
        // dd-mm-yyyy
        day = parts[0];
        month = parts[1] - 1;
        year = parts[2];
      }

      const dob = new Date(year, month, day);

      // Create birthday date for this year
      let birthdayThisYear = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate()
      );
      birthdayThisYear.setHours(0, 0, 0, 0);

      // If this year's birthday already passed and not today → use next year
      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(today.getFullYear() + 1);
      }

      // Include today + next 7 days
      if (birthdayThisYear >= today && birthdayThisYear <= nextWeek) {
        upcoming.push({
          employeeId: emp.employeeId,
          name: `${pd.firstName} ${pd.lastName}`,
          dob: pd.dob,
          birthdayDate: birthdayThisYear
        });
      }
    }

    return res.json({
      msg: "Birthdays today and next 7 days",
      count: upcoming.length,
      birthdays: upcoming
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

module.exports = { getBirthdaysThisWeek };
