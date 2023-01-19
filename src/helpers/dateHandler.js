class DateHandler {
  static MIN_YEAR = 1800;
  static MAX_YEAR = 9999;
  static DAYS = [
    {
      en: "Sun",
      long_en: "Sunday",
      vi: "CN",
      long_vi: "Chủ nhật",
    },
    {
      en: "Mon",
      long_en: "Monday",
      vi: "T2",
      long_vi: "Thứ 2",
    },
    {
      en: "Tue",
      long_en: "Tuesday",
      vi: "T3",
      long_vi: "Thứ 3",
    },
    {
      en: "Wed",
      long_en: "Wednesday",
      vi: "T4",
      long_vi: "Thứ 4",
    },
    {
      en: "Thur",
      long_en: "Thursday",
      vi: "T5",
      long_vi: "Thứ 5",
    },
    {
      en: "Fri",
      long_en: "Friday",
      vi: "T6",
      long_vi: "Thứ 6",
    },
    {
      en: "Sat",
      long_en: "Saturday",
      vi: "T7",
      long_vi: "Thứ 7",
    },
  ];
  static MONTHS = [
    {
      en: "Jan",
      long_en: "January",
      vi: "Tháng 1",
      long_vi: "Tháng 1",
    },
    {
      en: "Feb",
      long_en: "February",
      vi: "Tháng 2",
      long_vi: "Tháng 2",
    },
    {
      en: "Mar",
      long_en: "March",
      vi: "Tháng 3",
      long_vi: "Tháng 3",
    },
    {
      en: "Apr",
      long_en: "April",
      vi: "Tháng 4",
      long_vi: "Tháng 4",
    },
    {
      en: "May",
      long_en: "May",
      vi: "Tháng 5",
      long_vi: "Tháng 5",
    },
    {
      en: "Jun",
      long_en: "June",
      vi: "Tháng 6",
      long_vi: "Tháng 6",
    },
    {
      en: "Jul",
      long_en: "July",
      vi: "Tháng 7",
      long_vi: "Tháng 7",
    },
    {
      en: "Aug",
      long_en: "August",
      vi: "Tháng 8",
      long_vi: "Tháng 8",
    },
    {
      en: "Sep",
      long_en: "September",
      vi: "Tháng 9",
      long_vi: "Tháng 9",
    },
    {
      en: "Oct",
      long_en: "October",
      vi: "Tháng 10",
      long_vi: "Tháng 10",
    },
    {
      en: "Nov",
      long_en: "November",
      vi: "Tháng 11",
      long_vi: "Tháng 11",
    },
    {
      en: "Dec",
      long_en: "December",
      vi: "Tháng 12",
      long_vi: "Tháng 12",
    },
  ];

  static isLeapYear(y) {
    if (isNaN(y)) throw new Error("Invalid input: must be integer");
    if (!Number.isInteger(y)) throw new Error("Invalid input: must be integer");
    if (y < this.MIN_YEAR || y > this.MAX_YEAR)
      throw new Error("Invalid input: must be >= 1800 and <= 9999");

    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
  }

  // month: 1 - 12, date: 1 - 31
  static isValidDate(d, m, y) {
    // inputs validation
    if (isNaN(d) || isNaN(m) || isNaN(y))
      throw new Error("Invalid inputs: must be number");

    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y))
      throw new Error("Invalid inputs: must be integer");

    if (y < this.MIN_YEAR || y > this.MAX_YEAR)
      throw new Error("Invalid inputs: year must be >= 1800 and <= 9999");

    // start
    if (d > 31 || d < 1 || m < 1 || m > 12) {
      return false;
    }

    if (m === 2) {
      if (this.isLeapYear(y)) return d <= 29;
      return d <= 28;
    }

    if (m === 4 || m === 6 || m === 9 || m === 11) return d <= 30;

    return true;
  }

  // convert string ddmmyy or ddmmyyyy to Date object
  static stringToDate = (dateString) => {
    if (typeof dateString !== "string")
      throw new Error("Invalid input: must be string");

    if (isNaN(dateString))
      throw new Error("Invalid input: must be string of number");

    let val = dateString.trim();
    if (!(val.length === 6 || val.length === 8))
      throw new Error("Invalid input: ddmmyy or ddmmyyyy");

    let d, m, y;

    d = Number(val.slice(0, 2));
    m = Number(val.slice(2, 4));
    y = Number(val.slice(4));

    if (val.length === 6) {
      y = 2000 + y;
    }

    if (!this.isValidDate(d, m, y)) return null;

    return new Date(y, m - 1, d);
  };

  // month: 0 - 11
  static getDaysInMonth(y, m) {
    // inputs validation
    if (isNaN(y) || isNaN(m)) throw new Error("Invalid inputs: must be number");
    if (!Number.isInteger(y) || !Number.isInteger(m))
      throw new Error("Invalid inputs: must be integer");
    if (y < this.MIN_YEAR || y > this.MAX_YEAR)
      throw new Error("Invalid year: must be >= 1800 and <= 9999");
    if (m > 11 || m < 0)
      throw new Error("Invalid month: must be >= 0 and <= 11");

    // start
    if (this.isLeapYear(y) && m === 1) return 29;
    if (!this.isLeapYear(y) && m === 1) return 28;
    if ([3, 5, 8, 10].includes(m)) return 30;
    return 31;
  }

  static isSameDates(d1, d2) {
    const getType = (obj) => Object.prototype.toString.call(obj).slice(8, -1);
    if (getType(d1) !== "Date" || !getType(d2) !== "Date")
      throw new Error("Invalid inputs: must be date object");
    return d1.setHours(0, 0, 0, 0) === d2.setHours(0, 0, 0, 0);
  }
}

module.exports = DateHandler;
