import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Hero, HeroDocument} from "./schemas/hero.schema";
import {CreateHeroDto, UpdateHeroDto} from "./dto/hero.dto";
import {IGetAllServiceArg, IHeroesResponse} from "./interfaces/hero.interface";
import {S3} from "aws-sdk";
import {aws} from "../main";
import {uuid} from "uuidv4";

@Injectable()
export class HeroService {
    constructor(@InjectModel(Hero.name) private heroModel: Model<HeroDocument>) {
    }

    async createHero(createHeroDto: CreateHeroDto): Promise<Hero> {
            //перевіримо чи наш герой з таким іменем вже існує
            const alreadyExistsHero = await this.heroModel.findOne({nickname: createHeroDto.nickname})

            //якщо так - повертаємо помилку
            if (alreadyExistsHero) {
                throw new HttpException("Герой з таким ім`ям вже рятує планету", HttpStatus.BAD_REQUEST);
            }

            //якщо ні - створюємо об`єкт героя в бд mongo
            const newHero = await new this.heroModel({...createHeroDto, createdAt: new Date().toISOString()})
            await newHero.save()
            return newHero
    }

    async getAll(search: IGetAllServiceArg): Promise<IHeroesResponse> {
        try {
            //викачуємо потрібні нам ключі з об`єкта search
            const {searchQuery, skip} = search
            const heroResult = await this.heroModel.aggregate([
                {"$match": {nickname: {$regex: searchQuery ? searchQuery : ""}}},
                {"$sort": {createdAt: -1}},
                {
                    "$facet": {
                        metadata: [{$count: "total"}],
                        data: [{$skip: skip ? Number(skip) : 0}, {$limit: 5}]
                    }
                }
            ]);
            return {
                heroes: heroResult[0].data,
                count: heroResult[0].metadata[0]?.total
            }
        } catch (err) {
            throw new Error(err);
        }

    }

    async getOne(id): Promise<Hero> {
//перевіримо чи наш герой з таким id існує
            const hero = await this.heroModel.findById(id)
            if (hero) {
                //якщо так - повертаємо id героя
                const hero = await this.heroModel.findById(id)
                return hero
            } else {
                //якщо ні - повертаємо помилку
                throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
            }
    }

    async deleteOne(id: string): Promise<string> {


            //перевіримо чи наш герой з таким id існує
            const hero = await this.heroModel.findById(id)
            if (hero) {
                //якщо так - видаляємо
                await this.heroModel.findByIdAndDelete(id)

//якщо ми видалили героя який мав свої фото ми повинні не забути видалити їх і з бд aws s3
// так як вони вже нікому не належать

                //підключаємось до нашої бд aws s3
                const s3 = new S3({
                    region: aws.AWS_BUCKET_REGION,
                    accessKeyId: aws.AWS_ACCESS_KEY,
                    secretAccessKey: aws.AWS_SECRET_KEY
                })

                hero.images.map(async (url) => {
                    const filename = url.split('/')[url.split('/').length - 1].split('.')[0]
                    //вдаляємо файл зображення з бд aws s3
                    await s3.deleteObject({
                        Bucket: aws.AWS_BUCKET_NAME,
                        Key: `${filename}.jpeg`
                    }).promise()
                })

                return id
            } else {
                //якщо ні - повертаємо помилку
                throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
            }

    }

    async updateHero(id: string, updateHeroDto: UpdateHeroDto): Promise<Hero> {
//перевіримо чи наш герой з таким id існує
            const hero = await this.heroModel.findById(id)
            if (hero) {
                //якщо так - оновлюємо об`єкт героя
                const updatedHero = await this.heroModel.findByIdAndUpdate(id, {...updateHeroDto})
                return updatedHero
            } else {
                //якщо ні - повертаємо помилку
                throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
            }

    }

    async uploadImage(id: string, file: Express.Multer.File) {
//підключаємось до нашої бд aws s3
            const s3 = new S3({
                region: aws.AWS_BUCKET_REGION,
                accessKeyId: aws.AWS_ACCESS_KEY,
                secretAccessKey: aws.AWS_SECRET_KEY
            })

            //записуємо файл картинки в бд
            const upload = await s3.upload({
                Bucket: aws.AWS_BUCKET_NAME,
                Body: file.buffer,
                Key: `${uuid()}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`
            }).promise()

            //перевіримо чи наш герой з таким id існує
            const hero = await this.heroModel.findById(id)
            if (hero) {
                //якщо так - додаємо url файлу зображення до масиву Images об`єкта героя
                const images = hero.images
                const updatedImages = [...images, upload.Location]
                await this.heroModel.findByIdAndUpdate(id, {images: updatedImages})
            } else {
                //якщо ні - повертаємо помилку
                throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
            }
    }

    async deleteImage(id: string, fileName: string) {
            //підключаємось до нашої бд aws s3
            const s3 = new S3({
                region: aws.AWS_BUCKET_REGION,
                accessKeyId: aws.AWS_ACCESS_KEY,
                secretAccessKey: aws.AWS_SECRET_KEY
            })

            //вдаляємо файл зображення з бд aws s3
            await s3.deleteObject({
                Bucket: aws.AWS_BUCKET_NAME,
                Key: `${fileName}.jpeg`
            }).promise()

            //перевіримо чи наш герой з таким id існує
            const hero = await this.heroModel.findById(id)

            if (hero) {
                //якщо так - видаляємо url файлу зображення з масиву Images об`єкта героя
                const images = hero.images
                const updatedImages = images.filter(url => !url.includes(fileName))
                await this.heroModel.findByIdAndUpdate(id, {images: updatedImages})
            } else {
                //якщо ні - повертаємо помилку
                throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
            }
    }
}
