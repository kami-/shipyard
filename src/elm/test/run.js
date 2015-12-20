var page = require('webpage').create(),
    file = './HullParserTest.html';

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open(file, function(status) {
    console.log("Loaded page '" + file + "' with status '" + status + "'.");
    console.log('--------------------------------------------');
    if (status === 'success') {
        var resultText = page.evaluate(function() {
            return document.getElementById('result-text').innerHTML;
        });
        console.log(resultText);
        var resultPassed = page.evaluate(function() {
            return document.getElementById('result-passed').innerHTML === 'True';
        });
        console.log(resultPassed ? 'PASSED' : 'FAILED')
        phantom.exit(resultPassed ? 0 : 1);
    } else {
        phantom.exit(1);
    }
});