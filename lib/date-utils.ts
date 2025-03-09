export function getCurrentMonthYear() {
  const date = new Date()
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const currentMonth = months[date.getMonth()]
  const currentYear = date.getFullYear()

  return { currentMonth, currentYear, months }
}

export function isSameMonth(date: string, month: string, year: number) {
  const dateObj = new Date(date)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return months[dateObj.getMonth()] === month && dateObj.getFullYear() === year
}

