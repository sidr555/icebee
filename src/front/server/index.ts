import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';

const app = express();
const PORT = 5500;

// 允许跨域
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin,
//   X-Requested-With, Content-Type, Accept, Access-Control-Request-Method' )
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
//   res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
//   next();
// });

// 允许跨域
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});

app.get('/city', (req: Request, res: Response) => {
  setTimeout(() => {
    res.json({
      city: '上海',
    });
  });
});

app.post('/user', (req: Request, res: Response) => {
  setTimeout(() => {
    res.json({
      name: 'Dwayne Johnson',
      height: '196cm',
      citizenship: ['American', 'Canadian'],
      weight: '118kg',
    });
  }, 3000);
});

http.createServer(app).listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
