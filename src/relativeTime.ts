function timeSince(start: Date, end: Date = new Date()): string {
  const secondsPast = (end.getTime() - start.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.floor(secondsPast)}s`;
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)}m`;
  }
  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)}h`;
  }

  const day = start.getDate();
  const month = start
    .toDateString()
    .match(/ [a-zA-Z]*/)[0]
    .replace(" ", "");
  const optionalYear = start.getFullYear() == end.getFullYear() ? "" : ` ${start.getFullYear()}`;

  return `${day} ${month}${optionalYear}`;
}

export default timeSince;
