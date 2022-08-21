import {Test, TestingModule} from '@nestjs/testing';
import {HeroController} from '../hero.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Hero, HeroSchema} from "../schemas/hero.schema";
import {AppModule} from "../../app.module";
import {HeroService} from "../hero.service";
import {heroStub} from "./stubs/hero.stub";

jest.mock('../hero.service')

describe('HeroController', () => {
    let controller: HeroController;
    let service: HeroService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forFeature([{name: Hero.name, schema: HeroSchema}]),
                AppModule
            ],
            controllers: [HeroController],
            providers: [HeroService]
        }).compile();

        controller = module.get<HeroController>(HeroController);
        service = module.get<HeroService>(HeroService);
        jest.clearAllMocks()
    });

    describe('when getOne is called ', function () {
        let hero: Hero
        beforeEach(async () => {
            hero = await controller.getOne(heroStub().id)
        })
        test('then it should be called heroService', () => {
            expect(service.getOne).toBeCalledWith(heroStub().id)
        })

        test('then it should return hero', () => {
            expect(hero).toEqual(heroStub())
        })
    });
});
