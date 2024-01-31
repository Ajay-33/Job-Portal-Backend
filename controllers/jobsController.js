import jobsmodel from "../models/jobsmodel.js";
import mongoose from "mongoose";
import moment from "moment";

export const createJobController = async (req, res, next) => {
    const { company, position } = req.body;
    if (!company || !position) {
        next('Please provide all fields');
    }
    req.body.createdBy = req.user.userId
    const job = await jobsmodel.create(req.body)
    res.status(201).json({ job });
}

export const getAllJobsController = async (req, res, next) => {

    const { status, workType, search, sort } = req.query
    // conditions for searching filter
    const queryObject = {
        createdBy: req.user.userId
    }
    // logic for filters
    if (status && status !== 'all') {
        queryObject.status = status;
    }
    if (workType && workType != 'all') {
        queryObject.workType = workType;
    }
    if (search) {
        queryObject.position = { $regex: search, $options: 'i' }
    }
    let queryResult = jobsmodel.find(queryObject);

    // sorting filters
    if (sort === 'A-Z') {
        queryResult = queryResult.sort("company")
    }
    if (sort === 'Z-A') {
        queryResult = queryResult.sort("-company")

    }

    // Pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    queryResult = queryResult.skip(skip).limit(limit);
    const totalJobs = await jobsmodel.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    const jobs = await queryResult;
    // const jobs=await jobsmodel.find({createdBy:req.user.userId})
    res.status(200).json({
        totalJobs,
        jobs,
        numOfPage
    })
}

export const updateJobsController = async (req, res, next) => {
    const { id } = req.params;
    const { company, position } = req.body;
    // Validation
    if (!company || !position) {
        next('Please provide all Fields');
    }
    // find Job
    const job = await jobsmodel.findOne({ _id: id })
    // validation
    if (!job) {
        next('NO JObs found with this id');
    }
    if (!req.user.userId === job.createdBy.toString()) {
        next('You are not authorized to update this job');
        return;
    }
    const updateJob = await jobsmodel.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true
    })
    // res
    res.status(200).json({ updateJob });
}

export const DeleteJobController = async (req, res, next) => {
    const { id } = req.params;
    const job = await jobsmodel.findOne({ _id: id });
    if (!job) {
        next('No job found with this ID');
    }
    if (!req.user.userId === job.createdBy.toString()) {
        next('You are not authorized to update this job');
        return;
    }
    await job.deleteOne();
    res.status(200).json({ message: "Successfully job deleted" })
}

export const jobstatsController = async (req, res) => {
    const stats = await jobsmodel.aggregate([
        // search by user jobs
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId)
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ])

    // default stats 
    const defaultStats = {
        pending: stats.pending || 0,
        reject: stats.reject || 0,
        interview: stats.interview || 0
    }
    if (stats === null) stats = defaultStats

    // monthly yearly stats
    let monthlyApplication = await jobsmodel.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId)
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        }
    ])


    monthlyApplication = monthlyApplication.map(item => {
        const { _id: { year, month }, count } = item;
        const date = moment({ year, month: month - 1 }).format('MMM Y');
        return { date, count };
    }).reverse();


    res.status(200).json({ totalJobs: stats.length, stats, monthlyApplication })
}
