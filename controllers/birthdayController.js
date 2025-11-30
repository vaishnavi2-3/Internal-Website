const Employee = require("../models/Employee");
const PersonalDetails = require("../models/personalDetails");

const getBirthdaysThisWeek = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const employees = await Employee.find();
    const personalDetails = await PersonalDetails.find();

    const upcoming = [];

    for (const emp of employees) {
      const pd = personalDetails.find(
        p => p.officialEmail === emp.email
      );

      if (!pd || !pd.dob) continue;

      // -------- FIX: Parse the DOB string --------
      let parts;

      if (pd.dob.includes("-")) {
        parts = pd.dob.split("-");
      } else if (pd.dob.includes("/")) {
        parts = pd.dob.split("/");
      } else {
        continue; // invalid dob format
      }

      let day, month, year;

      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        year = parts[0];
        month = parts[1] - 1;
        day = parts[2];
      } else {
        // DD-MM-YYYY or DD/MM/YYYY
        day = parts[0];
        month = parts[1] - 1;
        year = parts[2];
      }

      const dob = new Date(year, month, day);

      // Create birthday for this year
      let thisYearBirthday = new Date(
        today.getFullYear(),
        dob.getMonth(),
        dob.getDate()
      );

      // If passed → next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      if (thisYearBirthday >= today && thisYearBirthday <= nextWeek) {
        upcoming.push({
          employeeId: emp.employeeId,
          name: pd.firstName + " " + pd.lastName,
          dob: pd.dob
        });
      }
    }

    return res.json({
      msg: "Upcoming birthdays in next 7 days",
      count: upcoming.length,
      birthdays: upcoming
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
module.exports = { getBirthdaysThisWeek };
