/**
 * Created by tal on 20/03/17.
 */
var request     = require("request"),
    moment      = require("moment"),
    async       = require("async"),
    json2csv    = require('json2csv'),
    fs          = require('fs'),
    nodemailer  = require('nodemailer'),
    smtp        = require('nodemailer-smtp-transport');

function init() {
    /** Creating the report dir once */
    var dir = './reports';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

/** Getting the tweets */
function getTweets (callback) {
    var options = { method: 'GET',
        url: 'https://api.twitter.com/1.1/search/tweets.json',
        qs: { q: 'Airbnb' },
        headers: {
            Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAIxSwwAAAAAAOYiSIE7jMVLq6bQbRBD8XRLNhHM%3DDtXUyY0AqVz7WgCDHHds0pi0XcvhCDptGqO4tm4GVjYDoXWyla'
        }
    };
    request(options, function (error, response, body) {
        if (error) callback(error);
        else {
            var response = JSON.parse(body);
            if(response && response.statuses.length) {
                console.log('Got '+response.statuses.length+' tweets');
                callback(null, JSON.parse(body));
            } else {
                callback('No twits, from the last 24 hours, where found!')
            }
        }
    });
}

/** Filtering the tweets for only the last 24 hours */
function filterTweets (twits, callback) {
    var tmpArr = [];
    async.each(twits.statuses, function(item, callback){
        if(moment().subtract(1, 'day').format() <= item.created_at) {
            tmpArr.push(item);
        }
        callback();
    },function(err){
        if(err) callback(err);
        else callback(null, tmpArr);
    })
}

function convertToCsv(data, callback) {
        var opts = {
            data: data
        };
        json2csv(opts, function(err, csv) {
            if (err)
                callback(err);
            else {
                callback(null, csv);
            }
        });
}

function createFile (csv, callback) {
    var filePath =  'reports/tweets.' + Date.now() + '.csv';
    fs.writeFile(filePath, csv, function (err) {
        if (err) callback(err);
        else {
            callback(null, filePath)
        }
    });
}

function sendFile(filePath, callback) {
    var _transporter = nodemailer.createTransport(smtp({
        host:  'smtp.sendgrid.net',
        port:  2525,
        auth: {
            user: 'amitdaniel',
            pass: 'abcdefg12345'
        }
    }));
    //@TODO: set email to dev@guesty.com
    var options = {
        from: 'taltal115@gmail.com',
        to: 'taltal115@gmail.com,dev@guesty.com',
        subject: 'GustyTest',
        html: '<h1>Check out the file bellow</h1>',
        attachments: [{path:filePath }]
    };
    _transporter.sendMail(options, function(err) {
        if(err) {
            console.error('Mail did not sent');
            callback(err);
        }
        else {
            console.log('Mail sent to '+options.to);
            /** Deleting the file after we send it. */
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath);
            }
            callback();
        }
    });
}

function run() {
    console.time('run');
    async.waterfall([
        getTweets,
        filterTweets,
        convertToCsv,
        createFile,
        sendFile
    ],function(err){
        console.timeEnd('run');
        if(err) console.log(err);
        else {
            console.log('Done!');
        }
    });
}

init();
run();
