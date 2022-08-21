import {MockModel} from "../../../database/test/support/mock.model";
import {Hero} from "../../schemas/hero.schema";
import {heroStub} from "../stubs/hero.stub";

export class HeroModel extends MockModel<Hero>{
    protected entityStub = heroStub()
}
