import { createClient } from "redis";
import { fetchNetstorming } from "../service";

const getHotelDetail = async (id: string) => {
  const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  const redisHotelKey = `hotel-${id}`;
  const value = await client.get(redisHotelKey);
  if (value) {
    return JSON.parse(value);
  }

  const hotelDetail = await fetchNetstorming("details", [{ hotel: { id } }]);

  await client.set(redisHotelKey, JSON.stringify(hotelDetail), {
    EX: 6048000,
  });

  return hotelDetail;
};

export default getHotelDetail;
