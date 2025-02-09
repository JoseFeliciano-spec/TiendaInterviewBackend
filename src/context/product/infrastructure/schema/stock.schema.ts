import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class StockMovementMongo extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, enum: ['entrada', 'salida'] })
  type: 'entrada' | 'salida';

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const StockMovementMongoSchema =
  SchemaFactory.createForClass(StockMovementMongo);
