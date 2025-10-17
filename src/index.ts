import morgan from 'morgan'; 
import express from 'express';
import cors from 'cors';
import routes from './routes';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // permite requisições do frontend
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log()
});