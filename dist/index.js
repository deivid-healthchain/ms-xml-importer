"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3007;
app.use((0, cors_1.default)()); // permite requisições do frontend
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
app.use('/api', routes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log();
});
//# sourceMappingURL=index.js.map