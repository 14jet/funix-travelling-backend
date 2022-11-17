const getDeltaImgs = (delta) => {
  let imgs = [];
  delta.ops.forEach((item) => {
    if (item?.insert?.image) {
      imgs.push(item.insert.image);
    }
  });

  return imgs;
};

const getItineraryImgs = (itinerary) => {
  let imgs = [];

  itinerary.forEach((item) => {
    if (item.type === "para") {
      imgs = imgs.concat(getDeltaImgs(item.content));
    }
  });

  return imgs;
};

module.exports = { getItineraryImgs, getDeltaImgs };
