const { Worker } = require("bullmq");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const pool = require("./db");

require("dotenv").config();



if(!fs.existsSync("reports")){
    fs.mkdirSync("reports");
}



const worker = new Worker(

"report-generation",


async(job)=>{


    const reportId = job.data.reportId;



    console.log(
        "Generating report:",
        reportId
    );



    /*
       Query aggregated data
    */

    const result = await pool.query(
        `
        SELECT
            category,
            COUNT(*) AS total_orders,
            SUM(amount) AS revenue

        FROM orders

        GROUP BY category
        `
    );





    /*
       Create PDF
    */


    const filePath =
    `reports/report_${reportId}.pdf`;



    const pdf = new PDFDocument();



    const stream =
    fs.createWriteStream(filePath);



    pdf.pipe(stream);



    pdf.fontSize(22)
       .text("Sales Report");


    pdf.moveDown();



    result.rows.forEach(row=>{


        pdf.fontSize(14)
        .text(
        `${row.category}
Orders: ${row.total_orders}
Revenue: $${row.revenue}
        `
        );


        pdf.moveDown();


    });



    pdf.end();




    await new Promise(resolve=>{
        stream.on(
            "finish",
            resolve
        );
    });




    /*
       Update report
    */


    await pool.query(

        `
        UPDATE reports

        SET status='completed',
            file_path=$1

        WHERE id=$2
        `,

        [
            filePath,
            reportId
        ]

    );



    console.log(
        "Completed report:",
        reportId
    );


},


{
connection:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT
}

}

);
