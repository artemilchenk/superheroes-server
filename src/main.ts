import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {config} from "aws-sdk";

export const aws={
  AWS_BUCKET_NAME: 'superheroes-artem',
  AWS_BUCKET_REGION: 'eu-central-1',
  AWS_ACCESS_KEY: 'AKIA3JWXIZK4BL4EY6GF',
  AWS_SECRET_KEY: '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',
}

async function bootstrap() {
    config.update({
        accessKeyId: aws.AWS_ACCESS_KEY,
        secretAccessKey: aws.AWS_ACCESS_KEY,
        region: aws.AWS_BUCKET_REGION
    })

    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(5001);
}

bootstrap();
