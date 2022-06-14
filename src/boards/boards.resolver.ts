import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BoardsService } from './boards.service';
import { BoardType } from './dto/create-board.dto';
import { BoardInput } from './input-boards.input';
import { Board } from './interfaces/board.interface'

@Resolver(of => BoardType)
export class BoardsResolver {
  constructor(private readonly boardsService: BoardsService) {}

  @Query(returns  => [BoardType])
  async boards(): Promise<BoardType[]> {
    return this.boardsService.findAll();
  }

  @Mutation(returns => BoardType)
  async createBoard(@Args('input') input: BoardInput): Promise<BoardType> {
    return this.boardsService.create(input);
  }

  @Mutation(returns => BoardType)
  async updateBoard(
    @Args('id') id: string,
    @Args('input') input: BoardInput,
  ) {
    return this.boardsService.update(id, input as Board);
  }

  @Mutation(returns  => BoardType)
  async deleteBoard(@Args('id') id: string) {
    return this.boardsService.delete(id);
  }

  @Query(returns => String)
  async hello() {
    return 'hello';
  }
}