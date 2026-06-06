"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const router_1 = __importDefault(require("./router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.type('application/json');
    next();
});
app.use('/api', router_1.default);
const port = process.env.BACKEND_PORT
    ? Number(process.env.BACKEND_PORT)
    : process.env.PORT
        ? Number(process.env.PORT)
        : 3001;
app.listen(port, () => {
    console.log(`NuLookUp backend listening on port ${port} — reload ${new Date().toISOString()}`);
});
