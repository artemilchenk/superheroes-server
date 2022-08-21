import {Hero} from "../../schemas/hero.schema";

export const heroStub = (): Hero => {
    return {
        nickname: 'test',
        real_name: '12345',
        origin_description: '12345',
        superpowers: '12345',
        catch_phrase: '12345',
        images: ['test', 'test'],
        createdAt: '12345',
        id:'00000'
    }
}
