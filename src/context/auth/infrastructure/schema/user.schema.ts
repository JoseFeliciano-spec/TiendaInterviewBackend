import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserMongo>;

@Schema({ collection: 'users' })
export class UserMongo {
  @Prop()
  name?: string;

  @Prop()
  email?: string;

  @Prop()
  password?: string;

  @Prop()
  createdAt?: string;

  @Prop()
  updatedAt?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserMongo);
