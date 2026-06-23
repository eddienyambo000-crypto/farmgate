import type { AnimalType } from "./types";

export interface CategoryMeta {
  type: AnimalType;
  label: string;
  labelRw: string; // Kinyarwanda
  plural: string;
  blurb: string;
}

export const CATEGORIES: Record<AnimalType, CategoryMeta> = {
  cattle: {
    type: "cattle",
    label: "Cattle",
    labelRw: "Inka",
    plural: "Cattle",
    blurb: "Dairy cows, calves & breeding stock",
  },
  goat: {
    type: "goat",
    label: "Goats",
    labelRw: "Ihene",
    plural: "Goats",
    blurb: "Meat, breeding & dairy goats",
  },
  sheep: {
    type: "sheep",
    label: "Sheep",
    labelRw: "Intama",
    plural: "Sheep",
    blurb: "Healthy sheep for meat & breeding",
  },
  pig: {
    type: "pig",
    label: "Pigs",
    labelRw: "Ingurube",
    plural: "Pigs",
    blurb: "Piglets, sows & fattened pigs",
  },
  chicken: {
    type: "chicken",
    label: "Chickens",
    labelRw: "Inkoko",
    plural: "Chickens",
    blurb: "Broilers, layers & chicks",
  },
  rabbit: {
    type: "rabbit",
    label: "Rabbits",
    labelRw: "Urukwavu",
    plural: "Rabbits",
    blurb: "Breeding & meat rabbit breeds",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
