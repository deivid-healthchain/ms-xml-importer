import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { setupSwagger } from './swagger';


const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors()); // permite requisições do frontend
app.use(express.json());
app.use(morgan('dev'));

// Setup Swagger documentation
setupSwagger(app);

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log()
});