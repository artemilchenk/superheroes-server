import {Test} from "@nestjs/testing";
import {HeroRepository} from "../hero.repository";
import {getModelToken} from "@nestjs/mongoose";
import {Hero} from "../schemas/hero.schema";
import {heroStub} from "./stubs/hero.stub";
import {HeroModel} from "./support/hero.model";
import {AggregateOptions} from "mongoose";

describe('HeroRepository', () => {
    let heroRepository: HeroRepository
    let heroModel: HeroModel

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                HeroRepository,
                {
                    provide: getModelToken(Hero.name),
                    useClass: HeroModel
                }
            ],


        }).compile()

        heroRepository = module.get<HeroRepository>(HeroRepository);
        heroModel = module.get<HeroModel>(getModelToken(Hero.name));
        jest.clearAllMocks()
    })

    describe('when finOne is called', () => {
        let hero: Hero

        beforeEach(async () => {
            jest.spyOn(heroModel, 'findOne')
            hero = await heroRepository.findOne({id: heroStub().id})

        })

        test('then it should be called heroModel', () => {
            expect(heroModel.findOne).toHaveBeenCalledWith({id: heroStub().id})
        })

        test('then it should return a hero', () => {
            expect(hero).toEqual(heroStub())
        })
    })

    describe('when aggregate is called', () => {
        let heroes: AggregateOptions

        beforeEach(async () => {
            jest.spyOn(heroModel, 'aggregate')
            heroes = await heroRepository.getAll({searchQuery: 'something', skip: '0'})
        })

        test('then it should be called heroModel', () => {
            expect(heroModel.aggregate).toHaveBeenCalledWith([
                {"$match": {nickname: {$regex: 'something'}}},
                {"$sort": {createdAt: -1}},
                {
                    "$facet": {
                        metadata: [{$count: "total"}],
                        data: [{$skip: 0}, {$limit: 5}]
                    }
                }
            ])
        })

        test('then it should return a hero', () => {
            expect(heroes).toEqual([heroStub()])
        })
    })
})



