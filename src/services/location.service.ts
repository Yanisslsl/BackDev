const findDistance = (cordA: any, cordB: any) => {
  const lon1 = (cordA.longitude * Math.PI) / 180;
  const lon2 = (cordB.longitude * Math.PI) / 180;
  const lat1 = (cordA.latitude * Math.PI) / 180;
  const lat2 = (cordB.latitude * Math.PI) / 180;
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  console.log(cordA, cordB);
  const a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));
  const r = 6371;
  return c * r;
};

export default findDistance;
