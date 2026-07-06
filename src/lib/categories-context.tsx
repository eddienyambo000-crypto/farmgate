"use client";

import { createContext, useContext } from "react";
import { CATEGORY_LIST, type CategoryMeta } from "./categories";

const Ctx = createContext<CategoryMeta[]>(CATEGORY_LIST);

export function CategoriesProvider({
  value,
  children,
}: {
  value: CategoryMeta[];
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCategories(): CategoryMeta[] {
  return useContext(Ctx);
}
