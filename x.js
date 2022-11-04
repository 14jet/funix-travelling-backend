// tạo tour mới
// sửa tour thì thêm tourId
const tour = {
  name: "string",
  journey: "string",
  highlights: ["string"],
  priceFrom: "number",
  priceIncludes: ["string"],
  priceExcludes: ["string"],
  images: [],
  departureDates: ["Date"],
  duration: "String",
  cancellationPolicy: ["String"],
  itinerary: [
    {
      title: "String",
      dateSession: "String",
      duration: "String",
      content: "Quill object",
    },
  ],
};

// server trả về tour data
const tourSchema = new Schema({
  name: String,
  journey: String,
  highlights: [String],
  itinerary: [],
  price: {
    from: Number,
    includes: [String],
    excludes: [String],
  },
  images: [String],
  time: {
    departureDates: [Date],
    duration: String,
  },
  cancellationPolicy: [String],
});
