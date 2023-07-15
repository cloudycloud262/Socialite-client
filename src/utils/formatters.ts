export const relTimeFormatter = (time: string): string => {
  const formatter = new Intl.RelativeTimeFormat("en", { style: "short" });
  const diff = new Date().getTime() - new Date(time).getTime();
  if (diff < 1000 * 60)
    return formatter.format(Math.floor(-diff / 1000), "seconds");
  else if (diff < 1000 * 60 * 60)
    return formatter.format(Math.floor(-diff / (1000 * 60)), "minutes");
  else if (diff < 1000 * 60 * 60 * 24)
    return formatter.format(Math.floor(-diff / (1000 * 60 * 60)), "hours");
  else if (diff < 1000 * 60 * 60 * 24 * 30)
    return formatter.format(Math.floor(-diff / (1000 * 60 * 60 * 24)), "days");
  else if (diff < 1000 * 60 * 60 * 24 * 30 * 12)
    return formatter.format(
      Math.floor(-diff / (1000 * 60 * 60 * 24 * 30)),
      "months"
    );
  else {
    return formatter.format(
      Math.floor(-diff / (1000 * 60 * 60 * 24 * 30 * 12)),
      "years"
    );
  }
};

export const numberFormatter = (val: number): string => {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(val);
};
