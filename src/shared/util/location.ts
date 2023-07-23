import axios from "axios";

import HttpError from "../models/http-error";

const getCoordsForAddress = async (address: string) => {
  const response = await axios(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError(
      "Could not find location for the specified address.",
      422
    );
  }

  return data.results[0].geometry.location;
};

export default getCoordsForAddress;
