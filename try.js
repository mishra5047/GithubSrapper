#!/usr/bin/env node
/*GitHub Scrapper - Made by Abhishek Mishra
*/ 
let pdf =  require('jspdf');

let request = require('request');
let cheerio = require('cheerio');
let fs = require("fs");

let $;

let args = process.argv.slice(2)

if(args.includes("-h")){
    //help
    console.log("\nEnter the Number of projects of top topics that you want to scrap issues of\n") 
    process.exit();
}

if(args.includes("-v")){
    console.log("version 1.0.0");
    process.exit();
}

let numberOfTopics = args[0];
request("https://github.com/topics", connHandler)

//functions to return the top three topics
function connHandler(err, stat, body){
    if(!err){
        console.log("Scrapping Topics Data from Github.com.............\n");
        $ = cheerio.load(body)
        let link = $(".no-underline.d-flex.flex-column.flex-justify-center")
        
        let name = $(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1")
        
        let nameList = []

        for(let i =0; i < link.length; i++){
            fileGen("https://github.com/" + $(link[i]).attr("href"), $(name[i]).text().trim());

         nameList.push($(name[i]).text().trim());
        }
    }
}

//function that will generate A directory which will in turn contain the .HTML, .TXT, and >PDF of the data scrapped
function fileGen(url, name){

    request(url, function(err, res, body){
        if(!err){
            let item = cheerio.load(body);
            let repoLink = item(".text-bold")
            fs.mkdirSync(name);
            console.log("\n\nTop projects for " + name + " are \n");

            if(numberOfTopics == undefined || numberOfTopics == 0){
                numberOfTopics = 5;
            }

            for(let i = 0; i <= numberOfTopics; i++){
                    let string = "https://github.com" + item(repoLink[i]).attr("href");
                    if(string !== undefined){
                        console.log(item(repoLink[i]).text().trim());
                        getIssuesList(string + "/issues", name,item(repoLink[i]).text().trim());
                }
            }
        }
    })

}

function getIssuesList(url, name, projectName){
    
    if(url === undefined){
        return;
    }
    
    request(url, function(err, res, body){
          if(!err){
            let dataIssues = cheerio.load(body);
            let issueList = dataIssues(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open");
            fs.mkdirSync(name + "/" + projectName);
            //generating an .HTML file
            fs.writeFileSync(name + "/" + projectName + "/" + projectName + ".html", body)
            
            //generating an .TXT file and attaching the header 
            fs.writeFileSync(name + "/" + projectName + "/" + projectName + ".txt","List of Issues for " + projectName + "\n\n\nFormat:\n\n" + "Issue Name" + "\nIssue Url\n\n");
            
            //generating an pdf
            const doc = new pdf.jsPDF();

            doc.setFontSize(22).text("Issue Links for " + projectName + "\n\n", 10, 10);
            doc.setFontSize(18).text("Format", 10, 30);
            doc.setFontSize(16).text("Issue Name" + "\nIssue Url\n\n", 10, 35);
            
            /*doc.pipe(fs.createWriteStream(name + "/" + projectName + "/" +  projectName + ".pdf"))
            doc.fontSize(22).text("Issue Links for " + projectName + "\n\n")
            
            doc.fontSize(18).text("Format");
            doc.fontSize(16).text("Issue Name" + "\nIssue Url\n\n");
            */
            let start = 60;

            for(let i =0; i < issueList.length; i++){
                let issueName = dataIssues(issueList[i]).text().trim();
                let issueUrl = ("https://github.com" + dataIssues(issueList[i]).attr("href")) + "\n";
                let object = "Issue Name => " + issueName + "\n" + "Url => " + issueUrl + "\n";
                fs.appendFileSync(name + "/" + projectName + "/" + projectName + ".txt", object)

                let cal = start + (i * 10);
                let check = 10; 
                if(cal >= 200 && check >= 200){
                    doc.addPage()
                    check = 10;
                    doc.setFontSize(14).setTextColor("#000000").text(issueName, 10, check + 10);
                    doc.setFontSize(12).setTextColor("#0000FF").textWithLink(issueUrl, 10, check + 5, {url : issueUrl});
                    check += 10;
                }else{
                    doc.setFontSize(14).setTextColor("#000000").text(issueName, 10, cal + 10);
                    doc.setFontSize(12).setTextColor("#0000FF").textWithLink(issueUrl, 10, cal + 5, {url : issueUrl});
                    check += 10; 
                       
                }

                //doc.addContent().fontSize(12).fillColor('blue').text(issueUrl + "\n");
            
                //doc.addContent().fillColor('blue').text(issueUrl + "\n")
            //.underline(1+10, 0, 160, 27, { color: '#0000FF' }).link(i + 10, 0, 160, 27, issueUrl);
                //  nameIssue.push(dataIssues(issueList[i]).text().trim());
                //urlIsssue.push("https://github.com" + dataIssues(issueList[i]).attr("href"));

            }

            doc.save(name + "/" + projectName + "/" +  projectName + ".pdf");
          //  console.log("number of issues for " + url + " are " + issueList.length);
           // console.log("***********************************\n");
        }
          
      })  

}
