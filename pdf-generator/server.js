const express = require("express");
const { Queue } = require("bullmq");
const pool = require("./db");
require("dotenv").config();


const app = express();

app.use(express.json());


const reportQueue = new Queue(
    "report-generation",
    {
        connection:{
            host:process.env.REDIS_HOST,
            port:process.env.REDIS_PORT
        }
    }
);



/*
Create report job
*/

app.post("/reports", async(req,res)=>{

    try{

        const result = await pool.query(
            `
            INSERT INTO reports(status)
            VALUES('processing')
            RETURNING id
            `
        );


        const reportId = result.rows[0].id;



        await reportQueue.add(
            "generate-pdf",
            {
                reportId
            }
        );


        res.json({

            message:"Report generation started",
            reportId

        });


    }

    catch(error){

        res.status(500).json({
            error:error.message
        });

    }


});





/*
Check report status
*/

app.get("/reports/:id", async(req,res)=>{


    const result = await pool.query(
        `
        SELECT *
        FROM reports
        WHERE id=$1
        `,
        [
            req.params.id
        ]
    );


    res.json(
        result.rows[0]
    );


});





app.listen(
process.env.PORT,
()=>{

console.log(
`Server running on port ${process.env.PORT}`
);

});
