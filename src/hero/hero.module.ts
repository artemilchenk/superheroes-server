import {forwardRef, Module} from '@nestjs/common';
import {HeroController} from './hero.controller';
import {HeroService} from './hero.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Hero, HeroSchema} from "./schemas/hero.schema";
import {AppModule} from "../app.module";

@Module({
    imports: [
        forwardRef(() => AppModule),
        MongooseModule.forFeature([{name: Hero.name, schema: HeroSchema}])],
    controllers: [HeroController],
    providers: [HeroService],
})
export class HeroModule {
}
