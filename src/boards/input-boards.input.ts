import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class BoardInput {
    @Field()
    readonly type: string;
    @Field(() => Int)
    readonly portnum: number;
    @Field()
    readonly description: string;
    @Field()
    readonly state: string;
  }
