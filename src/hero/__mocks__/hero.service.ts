import {heroStub} from "../test/stubs/hero.stub";

export const HeroService = jest.fn().mockResolvedValue({
    getOne: jest.fn().mockResolvedValue(heroStub()),
    getAll: jest.fn().mockResolvedValue({
        heroes: [heroStub()],
        count: 15
    }),
    createHero: jest.fn().mockResolvedValue(heroStub()),
    updateHero: jest.fn().mockResolvedValue(heroStub()),
})
