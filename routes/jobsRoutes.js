import express from "express"
import userAuth from "../middlewares/authmiddleware.js";
import { DeleteJobController, createJobController, getAllJobsController, jobstatsController, updateJobsController } from "../controllers/jobsController.js";
const router=express.Router();

// routes
// Create job
router.post('/create-job',userAuth,createJobController)

// GetJObs
router.get('/get-jobs',userAuth,getAllJobsController)

// Update jobs or put or patch
router.patch('/update-jobs/:id',userAuth,updateJobsController)

// Delete
router.delete('/delete-jobs/:id',userAuth,DeleteJobController)

// FILTERING 
router.get('/job-stats',userAuth,jobstatsController)



export default router