export const getLookup = (value, lookup) => {
  if (!Array.isArray(lookup) || lookup.length <= 0)
    return { Name: "", Color: "" }

  for (var i = lookup.length - 1; i >= 0; i--) {
    if ((value || value === 0) && value >= lookup[i].Value) {
      return lookup[i]
    }
  }
  return lookup[0]
}
