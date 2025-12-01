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

    // Current IST date
    const todayIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Default month = current month
    if (!month) {
      const y = todayIST.getFullYear();
      const m = todayIST.getMonth() + 1;
      month = `${y}-${m.toString().padStart(2, "0")}`;
    }

    const [year, monthNum] = month.split("-").map(Number);

    // Financial year
    let financialYearStart = year;
    if (monthNum < 4) financialYearStart = year - 1;
    const financialYearEnd = financialYearStart + 1;

    // Month range
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const employees = await Employee.find().select("_id fullName loginHistory");

    const allLeaves = await HrLeave.find({
      status: "Approved",
      toDate: { $gte: startDate },
      fromDate: { $lte: endDate }
    });

    const result = [];

    // For monthly average
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;

    // For today attendance
    const todayStr = todayIST.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    let presentToday = 0;
    let absentToday = 0;
    let leaveToday = 0;

    for (const emp of employees) {
      const loginSet = new Set(
        (emp.loginHistory || []).map(log => {
          const d = new Date(log.loginAt);
          return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        })
      );

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

      const labels = [];
      const present = [];
      const absent = [];
      const leave = [];

      let d = new Date(startDate);
      while (d <= endDate) {
        const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
        labels.push(dateStr);

        if (loginSet.has(dateStr)) {
          present.push(1);
          absent.push(0);
          leave.push(0);

          if (dateStr === todayStr) presentToday++;
        } else if (leaveSet.has(dateStr)) {
          present.push(0);
          absent.push(0);
          leave.push(1);

          if (dateStr === todayStr) leaveToday++;
        } else {
          present.push(0);
          absent.push(1);
          leave.push(0);

          if (dateStr === todayStr) absentToday++;
        }

        d.setDate(d.getDate() + 1);
      }

      // Calculate totals for averages
      totalPresent += present.reduce((a, b) => a + b, 0);
      totalAbsent += absent.reduce((a, b) => a + b, 0);
      totalLeave += leave.reduce((a, b) => a + b, 0);

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

    const totalEmployees = employees.length || 1;

    // Monthly Average Calculation
    const monthlyAverageAttendance = {
      totalDays: endDate.getDate(),
      presentAvg: Number((totalPresent / totalEmployees).toFixed(2)),
      absentAvg: Number((totalAbsent / totalEmployees).toFixed(2)),
      leaveAvg: Number((totalLeave / totalEmployees).toFixed(2))
    };

    const todayAttendance = {
      date: todayStr,
      presentToday,
      absentToday,
      leaveToday
    };

    return res.json({
      month,
      financialYear: `${financialYearStart}-${financialYearEnd}`,
      totalEmployees,
      todayAttendance,
      monthlyAverageAttendance,
      data: result
    });

  } catch (err) {
    console.error("All Employees Monthly Attendance Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
exports.getFinancialYearAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // 🟦 Get today's date in IST
    const today = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // 🟧 AUTO-DETECT FINANCIAL YEAR
    // If current month is Jan–Feb–Mar -> financial year starts last year
    const currentMonth = today.getMonth() + 1;
    const financialYearStart =
      currentMonth < 4 ? today.getFullYear() - 1 : today.getFullYear();
    const financialYearEnd = financialYearStart + 1;

    // 🟪 Month order for financial year Apr→Mar
    const months = [
      { name: "Apr", num: 4 },
      { name: "May", num: 5 },
      { name: "Jun", num: 6 },
      { name: "Jul", num: 7 },
      { name: "Aug", num: 8 },
      { name: "Sep", num: 9 },
      { name: "Oct", num: 10 },
      { name: "Nov", num: 11 },
      { name: "Dec", num: 12 },
      { name: "Jan", num: 1 },
      { name: "Feb", num: 2 },
      { name: "Mar", num: 3 },
    ];

    // 🟩 Fetch employee
    const employee = await Employee.findById(employeeId).select("fullName loginHistory");
    if (!employee) return res.status(404).json({ msg: "Employee not found" });

    // Login date set
    const loginSet = new Set(
      (employee.loginHistory || []).map(l =>
        new Date(l.loginAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
      )
    );

    // 🟥 Fetch approved leaves for whole financial year Apr→Mar
    const leaves = await HrLeave.find({
      employeeId,
      status: "Approved",
      toDate: { $gte: new Date(financialYearStart, 3, 1) }, // Apr 1
      fromDate: { $lte: new Date(financialYearEnd, 2, 31) } // Mar 31
    });

    const leaveSet = new Set();
    leaves.forEach(l => {
      let d = new Date(l.fromDate);
      while (d <= new Date(l.toDate)) {
        leaveSet.add(
          d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
        );
        d.setDate(d.getDate() + 1);
      }
    });

    // 🟦 Generate monthly attendance for Apr → Mar
    const graph = [];

    for (const m of months) {
      // For months Jan–Mar → use next calendar year
      const y = m.num >= 4 ? financialYearStart : financialYearEnd;

      const startDate = new Date(y, m.num - 1, 1);
      const endDate = new Date(y, m.num, 0);

      let present = 0, absent = 0, leave = 0;

      let d = new Date(startDate);
      while (d <= endDate) {
        const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

        if (loginSet.has(dateStr)) present++;
        else if (leaveSet.has(dateStr)) leave++;
        else absent++;

        d.setDate(d.getDate() + 1);
      }

      graph.push({ month: m.name, present, absent, leave });
    }

    return res.json({
      employeeId,
      employeeName: employee.fullName,
      financialYear: `${financialYearStart}-${financialYearEnd}`,
      graph
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.getYearlyAverageAttendance = async (req, res) => {
  try {
    let { year } = req.query;

    // Default: current year (IST)
    const todayIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    if (!year) year = todayIST.getFullYear();

const employees = await Employee.find({
  hasLoggedIn: true           // ✅ Correct filter for your schema
}).select("_id");
    const allLeaves = await HrLeave.find();

    const monthlyData = [];

    // Loop 12 months
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const totalDays = endDate.getDate();

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLeave = 0;

      for (const emp of employees) {
        const loginSet = new Set(
          (emp.loginHistory || []).map(log => {
            const d = new Date(log.loginAt);
            return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
          })
        );

        const empLeaves = allLeaves.filter(
          l => String(l.employeeId) === String(emp._id)
        );

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

        for (let day = 1; day <= totalDays; day++) {
          const date = new Date(year, month - 1, day);
          const dateStr = date.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });

          if (loginSet.has(dateStr)) {
            totalPresent++;
          } else if (leaveSet.has(dateStr)) {
            totalLeave++;
          } else {
            totalAbsent++;
          }
        }
      }

      const totalEmployees = employees.length || 1;

      monthlyData.push({
        month: `${year}-${String(month).padStart(2, "0")}`,
        presentAvg: Number((totalPresent / totalEmployees).toFixed(2)),
        absentAvg: Number((totalAbsent / totalEmployees).toFixed(2)),
        leaveAvg: Number((totalLeave / totalEmployees).toFixed(2)),
        totalDays
      });
    }

    res.json({
      year,
      totalEmployees: employees.length,
      monthlyAverages: monthlyData
    });

  } catch (err) {
    console.error("Yearly Average Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
