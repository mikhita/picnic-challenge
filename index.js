import csv from "csv-parser";
import fs from "fs";
import express from "express";

const app = express();

app.get("/", (_, res) => {
  const csvStatistic = {
    MostPopular: { topCount: 0, topAnswer: "" },
    male: {},
    University: { Instagram: 0, Facebook: 0, Linkedin: 0 },
  };
  fs.createReadStream("picnic.csv")
    .pipe(csv({}))
    .on("data", function (data) {
      if (csvStatistic["MostPopular"]["topCount"] < parseFloat(data["Count"])) {
        csvStatistic["MostPopular"]["topCount"] = data["Count"];
        csvStatistic["MostPopular"]["topAnswer"] = data["Answer"];
      }
      if (data["Segment Description"] === "Male respondents") {
        csvStatistic["male"][data["Answer"]] = data["Count"];
      }
      if (data["Segment Type"] === "University") {
        if (data["Answer"] === "Instagram") {
          csvStatistic["University"]["Instagram"] += parseFloat(data["Count"]);
        }
        if (data["Answer"] === "Facebook") {
          csvStatistic["University"]["Facebook"] += parseFloat(data["Count"]);
        }
        if (data["Answer"] === "Linkedin") {
          csvStatistic["University"]["Linkedin"] += parseFloat(data["Count"]);
        }
      }
    })
    .on("end", () => {
      res.send(`<div style="display: flex; flex-direction: column; align-items: center">
      <h1 style="margin-top: 50px">
        The most popular answer is : ${csvStatistic["MostPopular"]["topAnswer"]} with ${csvStatistic["MostPopular"]["topCount"]} score. 
      </h1>
      <h2 >With male respondents most popular is Snapchat and at least is Linkedin</h2>
    
      <div style="position: relative; width: 50vw; height: 40wh; margin-top: 50px" >
        <canvas id="PicnicBoard" style="background-color: rgba(240, 209, 225, 0.8)"></canvas>
      </div>
      <h2 >Facebook and Instagram score was more than 50% </h2>

      <div style="position: relative; width: 40vw; height: 40wh; margin-top: 50px" >
        <canvas id="UniversityP"></canvas>
      </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <script>
      const ctx = document.getElementById("PicnicBoard");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Instagram", "Facebook",  "Linkedin", "Snapchat"],
          datasets: [
            {
              label: "# male respondents",
              data: [${csvStatistic["male"]["Instagram"]}, ${csvStatistic["male"]["Facebook"]}, ${csvStatistic["male"]["Linkedin"]}, ${csvStatistic["male"]["Snapchat"]}],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        },
      });

      const universities =  document.getElementById("UniversityP");
      
      new Chart(universities, {
        type: 'doughnut',
        data: {
          labels: [
            'Instagram',
            'Facebook',
            'Linkedin'
          ],
          datasets: [{
            label: 'University',
            data: [${csvStatistic["University"]["Instagram"]}, ${csvStatistic["University"]["Facebook"]}, ${csvStatistic["University"]["Linkedin"]}],
            backgroundColor: [
              'pink',
              'orange',
              'magenta'
            ],
            hoverOffset: 4
          }]
      }
      });
    </script>
    ` );

  
    });
});

app.listen(process.env.PORT || 3000);