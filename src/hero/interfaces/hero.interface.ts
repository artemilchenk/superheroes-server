import {Hero} from "../schemas/hero.schema";

export interface IGetAllServiceArg{
  searchQuery?: string,
  skip: string
}

export interface  IHeroesResponse{
  count: number,
  heroes: Hero[]
}
