import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {AggregateOptions, FilterQuery, Model} from "mongoose";
import {Hero, HeroDocument} from "./schemas/hero.schema";

@Injectable()
export class HeroRepository {
    constructor(@InjectModel(Hero.name) private heroModel: Model<HeroDocument>) {
    }

    async getOneById(id: string): Promise<Hero> {
        return this.heroModel.findById(id);
    }

    async findOne(heroFilterQuery: FilterQuery<Hero>): Promise<Hero> {
        return this.heroModel.findOne(heroFilterQuery).exec();
    }

    async findByIdAndDelete(id: string){
        return this.heroModel.findByIdAndDelete(id);
    }

    async getAll(search: FilterQuery<Hero>): Promise<AggregateOptions> {
        //викачуємо потрібні нам ключі з об`єкта search
        const {searchQuery, skip} = search
        return this.heroModel.aggregate([
            {"$match": {nickname: {$regex: searchQuery ? searchQuery : ""}}},
            {"$sort": {createdAt: -1}},
            {
                "$facet": {
                    metadata: [{$count: "total"}],
                    data: [{$skip: skip ? Number(skip) : 0}, {$limit: 5}]
                }
            }
        ])
    }

    async createHero(hero: Hero): Promise<Hero> {
        const newUser = new this.heroModel(hero);
        return await newUser.save()
    }

    async findByIdAndUpdate(id: string, heroDto: Partial<Hero>): Promise<Hero> {
        return this.heroModel.findByIdAndUpdate(id, heroDto);
    }
}
