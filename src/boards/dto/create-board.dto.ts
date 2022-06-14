import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

@ObjectType()
export class BoardType {
  @Field(() => ID)
  @IsString()
  readonly id?: string;
  @Field()
  @IsString()
  @IsNotEmpty()
  readonly type: string;
  @Field(() => Int)
  @IsNumber()
  readonly portnum: number;
  @Field()
  @IsString()
  readonly description: string;
  @Field()
  @IsString()
  readonly state: string;
}
