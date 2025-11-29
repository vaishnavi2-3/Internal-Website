const Employee = require("../models/Employee");
const HrLeave = require("../models/Hrleaves");
const Leave = require("../models/leave");


exports.getTodayAttendanceSummary = async (req, res) => {
  try {
    // 1️⃣ Today date in IST
    const now = new Date();
    const today = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    today.setHours(0, 0, 0, 0);

    // 2️⃣ Get employees who logged in at least once
    const totalEmployees = await Employee.find({ loginCount: { $gt: 0 } })
      .select("_id fullName department loginCount");

    // Filter only employees with valid _id
    const validEmployees = totalEmployees.filter(emp => emp && emp._id);

    // 3️⃣ Get approved leaves
    const absentLeaves = await HrLeave.find({
      status: "Approved",
      fromDate: { $lte: today },
      toDate: { $gte: today }
    }).select("employeeId");

    // Convert only valid employeeId to string
    const absentIds = new Set(
      absentLeaves
        .filter(l => l && l.employeeId)
        .map(l => String(l.employeeId))  // safest conversion
    );

    // 4️⃣ Split present & absent
    const presentEmployees = [];
    const absentEmployees = [];

    for (let emp of validEmployees) {
      if (!emp || !emp._id) continue;  // skip null

      const id = String(emp._id);  // safe string conversion

      if (absentIds.has(id)) {
        absentEmployees.push(emp);
      } else {
        presentEmployees.push(emp);
      }
    }

    // 5️⃣ Final response
    return res.json({
      date: today.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      totalEmployees: validEmployees.length,
      presentToday: presentEmployees.length,
      absentToday: absentEmployees.length,
      presentEmployees,
      absentEmployees
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let { month } = req.query;

    // 1️⃣ If no month given → default current month
    const todayIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    if (!month) {
      const y = todayIST.getFullYear();
      const m = todayIST.getMonth() + 1;
      month = `${y}-${m.toString().padStart(2, "0")}`;
    }

    // 2️⃣ Parse month (YYYY-MM)
    const [year, monthNum] = month.split("-").map(Number);

    // 3️⃣ Financial Year Auto-switch (April → March)
    let financialYearStart = year;
    if (monthNum < 4) financialYearStart = year - 1;
    const financialYearEnd = financialYearStart + 1;

    // 4️⃣ Create month range
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // 5️⃣ Fetch employee login logs
    const employee = await Employee.findById(employeeId).select(
      "_id fullName loginHistory"
    );

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    // 6️⃣ Fetch total employees who have logged in at least once
    const totalLoggedEmployees = await Employee.countDocuments({
      loginCount: { $gt: 0 }
    });

    // Convert loginHistory to date-only (IST)
    const loggedInDates = new Set(
      (employee.loginHistory || []).map(log => {
        const d = new Date(log.loginAt);
        return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      })
    );

    // 7️⃣ Fetch approved leaves for employee
    const approvedLeaves = await HrLeave.find({
      employeeId,
      status: "Approved",
      toDate: { $gte: startDate },
      fromDate: { $lte: endDate }
    });

    // Build leave dates
    const leaveDates = new Set();
    approvedLeaves.forEach(l => {
      let d = new Date(l.fromDate);
      while (d <= new Date(l.toDate)) {
        leaveDates.add(
          d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
        );
        d.setDate(d.getDate() + 1);
      }
    });

    // 8️⃣ Build monthly attendance graph
    const labels = [];
    const present = [];
    const absent = [];
    const leave = [];

    let d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      labels.push(dateStr);

      if (loggedInDates.has(dateStr)) {
        present.push(1);
        absent.push(0);
        leave.push(0);
      } else if (leaveDates.has(dateStr)) {
        present.push(0);
        absent.push(0);
        leave.push(1);
      } else {
        present.push(0);
        absent.push(1);
        leave.push(0);
      }

      d.setDate(d.getDate() + 1);
    }

    // 9️⃣ Final Response
    return res.json({
      employeeId,
      employeeName: employee.fullName,
      month,
      financialYear: `${financialYearStart}-${financialYearEnd}`,
      totalDays: labels.length,

      // NEW FIELD ADDED ✔
      totalLoggedEmployees,

      labels,
      present,
      absent,
      leave
    });

  } catch (err) {
    console.error("Monthly Attendance Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
exports.getAllEmployeesMonthlyAttendance = async (req, res) => {
  try {
    let { month } = req.query;

    // 1️⃣ Default to current month (IST)
    const todayIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    if (!month) {
      const y = todayIST.getFullYear();
      const m = todayIST.getMonth() + 1;
      month = `${y}-${m.toString().padStart(2, "0")}`;
    }

    const [year, monthNum] = month.split("-").map(Number);

    // 2️⃣ Financial year handling (April → March)
    let financialYearStart = year;
    if (monthNum < 4) financialYearStart = year - 1;
    const financialYearEnd = financialYearStart + 1;

    // 3️⃣ Month date range
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // 4️⃣ Fetch all employees
    const employees = await Employee.find().select(
      "_id fullName loginHistory"
    );

    // 5️⃣ Fetch all approved leaves in this month for all employees
    const allLeaves = await HrLeave.find({
      status: "Approved",
      toDate: { $gte: startDate },
      fromDate: { $lte: endDate }
    });

    const result = [];

    // 6️⃣ Process each employee
    for (const emp of employees) {
      // Login dates set
      const loginSet = new Set(
        (emp.loginHistory || []).map(log => {
          const d = new Date(log.loginAt);
          return d.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata"
          });
        })
      );

      // Employee leaves
      const empLeaves = allLeaves.filter(l => String(l.employeeId) === String(emp._id));

      const leaveSet = new Set();
      empLeaves.forEach(l => {
        let d = new Date(l.fromDate);
        while (d <= new Date(l.toDate)) {
          leaveSet.add(
            d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
          );
          d.setDate(d.getDate() + 1);
        }
      });

      // Build monthly summary
      const labels = [];
      const present = [];
      const absent = [];
      const leave = [];

      let d = new Date(startDate);
      while (d <= endDate) {
        const dateStr = d.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata"
        });
        labels.push(dateStr);

        if (loginSet.has(dateStr)) {
          present.push(1);
          absent.push(0);
          leave.push(0);
        } else if (leaveSet.has(dateStr)) {
          present.push(0);
          absent.push(0);
          leave.push(1);
        } else {
          present.push(0);
          absent.push(1);
          leave.push(0);
        }

        d.setDate(d.getDate() + 1);
      }

      result.push({
        employeeId: emp._id,
        employeeName: emp.fullName,
        month,
        financialYear: `${financialYearStart}-${financialYearEnd}`,
        totalDays: labels.length,
        presentCount: present.reduce((a, b) => a + b, 0),
        absentCount: absent.reduce((a, b) => a + b, 0),
        leaveCount: leave.reduce((a, b) => a + b, 0),
        labels,
        present,
        absent,
        leave
      });
    }

    return res.json({
      month,
      financialYear: `${financialYearStart}-${financialYearEnd}`,
      totalEmployees: result.length,
      data: result
    });

  } catch (err) {
    console.error("All Employees Monthly Attendance Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
