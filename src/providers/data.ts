import { DataProvider } from "@refinedev/core";
import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";
import { createiTunesDataProvider, parseiTunesXML } from "../dataProvider/itunes";

const { dataProvider: restDataProvider, kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
});

const musicResources = new Set(["tracks", "artists", "albums"]);

let itunesDataProvider: Partial<DataProvider> | null = null;
let initItunesPromise: Promise<void> | null = null;

const initItunes = async () => {
  if (itunesDataProvider) return;

  if (!initItunesPromise) {
    initItunesPromise = fetch("/iTunes Music Library.xml")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load iTunes library XML (status: ${res.status})`);
        }
        return res.text();
      })
      .then((xml) => {
        const tracks = parseiTunesXML(xml);
        itunesDataProvider = createiTunesDataProvider(tracks);
      })
      .catch((error) => {
        console.error("iTunes data provider initialization failed:", error);
        itunesDataProvider = createiTunesDataProvider([]);
      });
  }

  return initItunesPromise;
};

const getDataProvider = async (resource: string) => {
  if (!musicResources.has(resource)) {
    return restDataProvider;
  }
  await initItunes();
  return itunesDataProvider ?? restDataProvider;
};

export const dataProvider: DataProvider = {
  ...restDataProvider,

  getList: async (params) => {
    const provider = await getDataProvider(params.resource);
    return provider.getList?.(params) ?? restDataProvider.getList(params);
  },

  getOne: async (params) => {
    const provider = await getDataProvider(params.resource);
    return provider.getOne?.(params) ?? restDataProvider.getOne(params);
  },
};

export { kyInstance };
