/* jshint esversion: 2015 */
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

var web_config = require('./autoperc-web-config.js');

function read_csv () {
	var csv = fs.readFileSync(web_config.waterlevel_csv_path, { encoding: 'utf8' }).split('\n');
	var headers = csv[0].split(',');
	var dict = {};
	for (var line = 1; line < csv.length; line++) {
		if (!csv[line]) break;
		var columns = csv[line].split(',');
		dict[columns[0]] = parseInt(columns[1]);
	}
	return dict;
}

app.get('/', function (req, res) {
	var config = JSON.parse(fs.readFileSync(web_config.autoperc_config_path, { encoding: 'utf8' }));
	res.render('index', {
		levels: read_csv(),
		config: config
	});
});

app.post('/api/config', function (req, res) {
	console.error(req.body);
	var config = JSON.parse(fs.readFileSync(web_config.autoperc_config_path, { encoding: 'utf8' }));
	fs.writeFileSync(web_config.autoperc_config_path, JSON.stringify({
		enable: req.body.enable ? (req.body.enable.toLowerCase() === 'on') : false,
		upper_threshold: parseInt(req.body.upper_threshold),
		lower_threshold: parseInt(req.body.lower_threshold),
		basin_low: config.basin_low || false
	}));
	res.redirect('/');
});

app.get('/api/reset_basin', function (req, res) {
	var config = JSON.parse(fs.readFileSync(web_config.autoperc_config_path, { encoding: 'utf8' }));
	fs.writeFileSync(web_config.autoperc_config_path, JSON.stringify({
		enable: config.enable,
		upper_threshold: config.upper_threshold,
		lower_threshold: config.lower_threshold,
		basin_low: false
	}));
	res.redirect('/');
});

app.listen(web_config.http_port, function () {
    console.error('web interface listening on ' + web_config.http_port);
});
