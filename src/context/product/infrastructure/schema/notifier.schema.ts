import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class NotificationMongo extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  remainingQuantity: number;

  @Prop({ required: true, default: Date.now })
  registrationDate: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const NotificationMongoSchema =
  SchemaFactory.createForClass(NotificationMongo);

// Añadir timestamps automáticos
NotificationMongoSchema.set('timestamps', {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});
