import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeroDocument = Hero & Document;

@Schema()
export class Hero {
  @Prop()
  nickname: string;

  @Prop()
  real_name: string;

  @Prop()
  origin_description: string;

  @Prop()
  superpowers: string;

  @Prop()
  catch_phrase: string;

  @Prop()
  images: string[];

  @Prop()
  createdAt: string;
}

export const HeroSchema = SchemaFactory.createForClass(Hero);
