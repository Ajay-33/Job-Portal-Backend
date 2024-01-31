// const express=require("express")
import express from "express";
import "express-async-errors";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";
import morgan from "morgan";

// security packages
// middlewares to protects
// helmet secures header section
// to sanitize input = xss-clean
// to limit repeated requests
import helmet from "helmet";
import xss from "xss-clean";
import ExpressMongoSanitize from "express-mongo-sanitize";

// files imports
import connectDB from "./config/db.js";
// routes
import testRoutes from "./routes/testRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import errormiddleware from "./middlewares/errormiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
// DOT ENV Config
dotenv.config();

// mongoDb connection
connectDB();

// rest object
const app=express()

// middlewares
app.use(helmet());
app.use(xss());
app.use(ExpressMongoSanitize());
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));



// routes
app.use('/api/v1/test',testRoutes)
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/job',jobsRoutes)

// Validation middleware
app.use(errormiddleware)

const PORT=process.env.PORT || 8080
// listen
app.listen(PORT,()=>{
    console.log(`Node server running in ${process.env.DEV_MODE} mode on port number ${PORT}`.rainbow);
})