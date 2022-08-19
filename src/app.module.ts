import {forwardRef, Module} from '@nestjs/common';
import {HeroModule} from './hero/hero.module';
import {MongooseModule} from "@nestjs/mongoose";


@Module({
    imports: [
        forwardRef(() => HeroModule),
        MongooseModule.forRoot('mongodb+srv://artem:03mern09@cluster0.adan7ml.mongodb.net/?retryWrites=true&w=majority')
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
