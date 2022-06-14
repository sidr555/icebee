import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardType } from './dto/create-board.dto';
import { Board } from './interfaces/board.interface';
import { BoardInput } from './input-boards.input';


@Injectable()
export class BoardsService {
  constructor(@InjectModel('Board') private boardModel: Model<Board>) {}

  async create(createBoardDto: BoardInput): Promise<BoardType> {
    const createdBoard = new this.boardModel(createBoardDto);
    return await createdBoard.save();
  }

  async findAll(): Promise<BoardType[]> {
    return await this.boardModel.find().exec();
  }

  async findOne(id: string): Promise<BoardType> {
    return await this.boardModel.findOne({ _id: id });
  }

  async delete(id: string): Promise<BoardType> {
    return await this.boardModel.findByIdAndRemove(id);
  }

  async update(id: string, board: Board): Promise<BoardType> {
    return await this.boardModel.findByIdAndUpdate(id, board, { new: true });
  }
}