export interface DataLoaders {
  UserLoader: ReturnType<
    typeof import("../../modules/user/UserLoader").getLoader
  >;
  BookingLoader: ReturnType<
    typeof import("../../modules/booking/BookingLoader").getLoader
  >;
  CityLoader: ReturnType<
    typeof import("../../modules/city/CityLoader").getLoader
  >;
  CountryLoader: ReturnType<
    typeof import("../../modules/country/CountryLoader").getLoader
  >;
  HotelLoader: ReturnType<
  typeof import("../../modules/hotel/HotelLoader").getLoader
>;
}

const loaders: {
  [Name in keyof DataLoaders]: () => DataLoaders[Name];
} = {} as any;

const registerLoader = <Name extends keyof DataLoaders>(
  key: Name,
  getLoader: () => DataLoaders[Name]
) => {
  loaders[key] = getLoader as any;
};

const getDataloaders = (): DataLoaders =>
  (Object.keys(loaders) as (keyof DataLoaders)[]).reduce(
    (prev, loaderKey) => ({
      ...prev,
      [loaderKey]: loaders[loaderKey](),
    }),
    {}
  ) as any;

export { registerLoader, getDataloaders };
