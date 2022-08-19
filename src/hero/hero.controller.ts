import {
    Body,
    Controller,
    Delete, FileTypeValidator,
    Get,
    HttpCode, MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Put, Query,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import {CreateHeroDto, UpdateHeroDto} from "./dto/hero.dto";
import {HeroService} from "./hero.service";
import {FileInterceptor} from "@nestjs/platform-express";
import {Hero} from "./schemas/hero.schema";

@Controller('hero')
export class HeroController {
    constructor(private heroService: HeroService) {
    }

    @Post('create')
    @HttpCode(201)
    create(@Body() createHeroDto: CreateHeroDto): Promise<Hero> {
        return this.heroService.createHero(createHeroDto)
    }

    @Get('query')
    @HttpCode(200)
    all(@Query() search) {
        return this.heroService.getAll(search)
    }

    @Get(':id')
    @HttpCode(200)
    one(@Param('id') id: string): Promise<Hero> {
        return this.heroService.getOne(id)
    }

    @Delete(':id')
    @HttpCode(200)
    delete(@Param('id') id: string): Promise<string> {
        return this.heroService.deleteOne(id)
    }

    @Put(':id')
    @HttpCode(200)
    update(@Param('id') id: string, @Body() updateDto: UpdateHeroDto): Promise<Hero> {
        return this.heroService.updateHero(id, updateDto)
    }

    @Post('upload/:id')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    fileUpload(@Param('id') id: string, @UploadedFile('file', new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({maxSize: 1000000}),
            new FileTypeValidator({fileType: 'jpeg'}),
        ],
    })) file: Express.Multer.File) {
        return this.heroService.uploadImage(id, file)
    }

    @Post('delete/:id')
    @HttpCode(200)
    fileCreate(@Param('id') id: string, @Body('fileName') fileName: string,) {
        return this.heroService.deleteImage(id, fileName)
    }
}

