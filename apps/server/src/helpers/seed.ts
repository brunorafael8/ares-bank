import { Client } from "@elastic/elasticsearch";
import Country from "../modules/country/CountryModel";
import { connectDatabase } from "../database";
import { v4 as uuidv4 } from "uuid";
import { fetchNetstorming } from "../service";

const esClient = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elasticTest",
    password: "123456",
  },
});

(async () => {
  await connectDatabase();
  const startTime = performance.now();
  const responseData: any = await fetchNetstorming("countries");
  const asyncFilter = await Promise.all(
    responseData.countries[0].country.map(async (country) => {
      const collection = await Country.find({
        code: country.code[0].$.value,
      });

      if (collection.length > 0) {
        return false;
      }

      return true;
    })
  );

  const filter = responseData.countries[0].country.filter(
    (_, index: number) => asyncFilter[index]
  );

  const getCountries = async () => {
    try {
      for (const i of filter) {
        const countryIndex = i;
        const collection = await Country.find({
          code: countryIndex.code[0].$.value,
        });

        if (collection.length > 0) {
          return console.log(`countries already created`);
        }

        const citiesData = (await fetchNetstorming("cities", [
          {
            country: {
              code: countryIndex.code[0].$.value,
            },
          },
        ])) as { cities: { city: any[] } };

        const formatCities = citiesData.cities[0].city
          ? await citiesData.cities[0].city.map((city: any) => {
              return {
                code: city.code[0].$.value,
                names: city.names[0].name.map((name) => {
                  return {
                    language: name.$?.language,
                    value: name.$?.value,
                  };
                }),
              };
            })
          : [];

        const countryPayload = {
          code: countryIndex.code[0].$.value,
          names: countryIndex.names[0].name.map((name) => {
            return {
              language: name.$?.language,
              value: name.$?.value,
              cities: formatCities,
            };
          }),
          cities: formatCities,
        };

        await new Country(countryPayload).save();

        await esClient.index({
          index: "countries",
          document: countryPayload,
          id: uuidv4(),
        });
      }

      return await Country.find();
    } catch (error) {
      console.log(`error: ${error}`);
    }
  };

  const countries = await getCountries();

  
  if (
    !countries ||
    responseData.countries[0].country.length !== countries.length
  ) {
    await getCountries();
  }

  const endTime = performance.now();

  console.log(`Execution time: ${endTime - startTime} ms`);
  // eslint-disable-next-line
  console.log(`countries created`);

  process.exit(0);
})();