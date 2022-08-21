import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Hero} from "./schemas/hero.schema";
import {CreateHeroDto, UpdateHeroDto} from "./dto/hero.dto";
import {IGetAllServiceArg, IHeroesResponse} from "./interfaces/hero.interface";
import {S3} from "aws-sdk";
import {uuid} from "uuidv4";
import {config} from "aws-sdk";
import {HeroRepository} from "./hero.repository";

const aws = {
    AWS_BUCKET_NAME: 'superheroes-artem',
    AWS_BUCKET_REGION: 'eu-central-1',
    AWS_ACCESS_KEY: 'AKIA3JWXIZK4BL4EY6GF',
    AWS_SECRET_KEY: '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',
}
config.update({
    accessKeyId: aws.AWS_ACCESS_KEY,
    secretAccessKey: aws.AWS_ACCESS_KEY,
    region: aws.AWS_BUCKET_REGION
})

@Injectable()
export class HeroService {
    constructor(private readonly heroRepository: HeroRepository) {
    }

    async createHero(createHeroDto: CreateHeroDto): Promise<Hero> {
        //перевіримо чи наш герой з таким іменем вже існує
        const alreadyExistsHero = await this.heroRepository.findOne({nickname: createHeroDto.nickname})

        //якщо так - повертаємо помилку
        if (alreadyExistsHero) {
            throw new HttpException("Герой з таким ім`ям вже рятує планету", HttpStatus.BAD_REQUEST);
        }

        //якщо ні - створюємо об`єкт героя в бд mongo
        return await this.heroRepository.createHero({...createHeroDto, createdAt: new Date().toISOString()})
    }

    async getAll(search: IGetAllServiceArg): Promise<IHeroesResponse> {
        try {
            //отримуємо масив heroes по запиту search
            const heroResult = await this.heroRepository.getAll(search);
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
        const hero = await this.heroRepository.getOneById(id)
        if (hero) {
            //якщо так - повертаємо id героя
            return hero
        } else {
            //якщо ні - повертаємо помилку
            throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
        }
    }

    async deleteOne(id: string): Promise<string> {
        //перевіримо чи наш герой з таким id існує
        const hero = await this.heroRepository.getOneById(id)
        if (hero) {
            //якщо так - видаляємо
            await this.heroRepository.findByIdAndDelete(id)

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
        const hero = await this.heroRepository.getOneById(id)
        if (hero) {
            //якщо так - оновлюємо об`єкт героя
            return await this.heroRepository.findByIdAndUpdate(id, {...updateHeroDto})
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
        const hero = await this.heroRepository.getOneById(id)
        if (hero) {
            //якщо так - додаємо url файлу зображення до масиву Images об`єкта героя
            const images = hero.images
            const updatedImages = [...images, upload.Location]
            await this.heroRepository.findByIdAndUpdate(id, {images: updatedImages})
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
        const hero = await this.heroRepository.getOneById(id)

        if (hero) {
            //якщо так - видаляємо url файлу зображення з масиву Images об`єкта героя
            const images = hero.images
            const updatedImages = images.filter(url => !url.includes(fileName))
            await this.heroRepository.findByIdAndUpdate(id, {images: updatedImages})
        } else {
            //якщо ні - повертаємо помилку
            throw new HttpException("Героя з таким id не існує", HttpStatus.BAD_REQUEST);
        }
    }
}
