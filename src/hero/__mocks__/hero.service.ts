import {heroStub} from "../test/stubs/hero.stub";

export const HeroService = jest.fn().mockReturnValue({
    getOne: jest.fn().mockResolvedValue(heroStub()),
    getAll: jest.fn().mockResolvedValue([heroStub()])
})
