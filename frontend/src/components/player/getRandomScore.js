const getRandomScore = () => {
  const random = Math.random() * 100;

  if (random <= 20) {
    return Math.floor(Math.random() * 20) + 1;
  } else if (random <= 50) {
    return Math.floor(Math.random() * 30) + 21;
  } else if (random <= 90) {
    return Math.floor(Math.random() * 29) + 51;
  } else if (random <= 100) {
    return Math.floor(Math.random() * 10) + 91;
  }
};

export default getRandomScore;
