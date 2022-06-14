import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { BoardsModule } from '../src/boards/boards.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { Board } from '../src/boards/interfaces/board.interface';

describe('BoardsController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        BoardsModule,
        MongooseModule.forRoot('mongodb://localhost/nestgraphqltesting'),
        GraphQLModule.forRoot({
          autoSchemaFile: 'schema.gql',
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const board: Board = {
    worker: 'qwe',
    type: 'AMD RX580',
    portnum: 1,
    description: 'Description of this great board',
    state: 'active'
  };

  let id: string = '';

  const updatedBoard: Board = {
    worker: 'qwe',
    type: 'AMD RX580',
    portnum: 1,
    description: 'Description [UPDATED] of this great board',
    state: 'active'
  };

  const createboardObject = JSON.stringify(board).replace(
    /\"([^(\")"]+)\":/g,
    '$1:',
  );

  const createBoardQuery = `
  mutation {
    createBoard(input: ${createboardObject}) {
      type
      price
      description
      id
    }
  }`;

  it('createBoard', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: createBoardQuery,
      })
      .expect(({ body }) => {
        const data = body.data.createBoard;
        id = data.id;
        expect(data.type).toBe(board.type);
        expect(data.description).toBe(board.description);
        expect(data.worker).toBe(board.worker);
        expect(data.portnum).toBe(board.portnum);
        expect(data.state).toBe(board.state);
      })
      .expect(200);
  });

  it('getBoards', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: '{boards{type, worker, description, id, portnum, state}}',
      })
      .expect(({ body }) => {
        const data = body.data.boards;
        const boardResult = data[0];
        expect(data.length).toBeGreaterThan(0);
        expect(boardResult.type).toBe(board.type);
        expect(boardResult.description).toBe(board.description);
        expect(boardResult.worker).toBe(board.worker);
        expect(boardResult.portnum).toBe(board.portnum);
        expect(boardResult.state).toBe(board.state);
      })
      .expect(200);
  });

  const updateBoardObject = JSON.stringify(updatedBoard).replace(
    /\"([^(\")"]+)\":/g,
    '$1:',
  );

  it('updateBoard', () => {
    const updateBoardQuery = `
    mutation {
      updateBoard(id: "${id}", input: ${updateBoardObject}) {
        type
        worker
        portnum
        description
        state
        id
      }
    }`;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: updateBoardQuery,
      })
      .expect(({ body }) => {
        const data = body.data.updateBoard;
        expect(data.type).toBe(updatedBoard.type);
        expect(data.worker).toBe(updatedBoard.worker);
        expect(data.portnum).toBe(updatedBoard.portnum);
        expect(data.description).toBe(updatedBoard.description);
        expect(data.state).toBe(updatedBoard.state);
      })
      .expect(200);
  });

  it('deleteBoard', () => {
    const deleteBoardQuery = `
      mutation {
        deleteBoard(id: "${id}") {
          type
          worker
          portnum
          description
          state
          id
        }
      }`;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: deleteBoardQuery,
      })
      .expect(({ body }) => {
        const data = body.data.deleteBoard;
        expect(data.type).toBe(updatedBoard.type);
        expect(data.worker).toBe(updatedBoard.worker);
        expect(data.portnum).toBe(updatedBoard.portnum);
        expect(data.description).toBe(updatedBoard.description);
        expect(data.state).toBe(updatedBoard.state);
      })
      .expect(200);
  });
});
